import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@repo/db";
import { credential } from "@repo/db/schema";

import { protectedProcedure } from "../trpc";

export const credentialRouter = {
  // Fetch all credentials for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    // session object might vary, usually session.user.id
    if (!session || !session.user || !session.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const credentials = await db.query.credential.findMany({
      where: eq(credential.userId, session.user.id),
      orderBy: (cred, { desc }) => [desc(cred.createdAt)],
    });

    return credentials;
  }),

  // Create a new credential
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        url: z.string().optional(),
        note: z.string().optional(),
        iv: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      if (!session || !session.user || !session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [newCredential] = await db
        .insert(credential)
        .values({
          ...input,
          userId: session.user.id,
        })
        .returning();

      return newCredential;
    }),
};
