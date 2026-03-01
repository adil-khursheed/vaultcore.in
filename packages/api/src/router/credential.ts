import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@repo/db";
import { credential } from "@repo/db/schema";

import { protectedProcedure } from "../trpc";

export const credentialRouter = {
  // Fetch all credentials for the current user
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // session object might vary, usually session.user.id
      if (!session || !session.user || !session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { organizationId } = input;
      if (!organizationId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const credentials = await db.query.credential.findMany({
        where: eq(credential.organizationId, organizationId),
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
        organizationId: z.string(),
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
        })
        .returning();

      return newCredential;
    }),

  // Batch create credentials
  batchCreate: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        credentials: z.array(
          z.object({
            title: z.string().min(1),
            username: z.string().min(1),
            password: z.string().min(1),
            url: z.string().optional(),
            note: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      if (!session || !session.user || !session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { organizationId, credentials: credentialsData } = input;

      const values = credentialsData.map((cred) => ({
        ...cred,
        organizationId,
      }));

      const newCredentials = await db
        .insert(credential)
        .values(values)
        .returning();

      return newCredentials;
    }),
};
