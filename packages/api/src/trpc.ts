import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import type { Auth } from "@repo/auth";
import { and, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { member } from "@repo/db/schema";

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: Auth;
}) => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });

  return {
    authApi,
    session,
    db,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development to help catch unwanted waterfalls by simulating network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public Procedure
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected Procedure — requires authenticated session
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Middleware that verifies the user is a member of the organization
 * specified in the input's `organizationId` field.
 * Attaches the member record to the context for downstream use.
 */
const orgMemberMiddleware = t.middleware(
  async ({ ctx, next, input: rawInput }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const input = rawInput as { organizationId?: string } | undefined;
    const organizationId = input?.organizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "organizationId is required",
      });
    }

    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, ctx.session.user.id),
      ),
    });

    if (!memberRecord) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization",
      });
    }

    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
        memberRecord,
      },
    });
  },
);

/**
 * Org Member Procedure — requires authenticated user who is a member of the specified org
 */
export const orgMemberProcedure = t.procedure
  .use(timingMiddleware)
  .use(orgMemberMiddleware);

/**
 * Org Admin Procedure — requires authenticated user who is an admin or owner of the specified org
 */
export const orgAdminProcedure = t.procedure
  .use(timingMiddleware)
  .use(orgMemberMiddleware)
  .use(({ ctx, next }) => {
    if (
      ctx.memberRecord.role !== "admin" &&
      ctx.memberRecord.role !== "owner"
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only organization admins or owners can perform this action",
      });
    }
    return next({ ctx });
  });
