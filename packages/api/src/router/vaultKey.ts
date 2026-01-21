import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { vaultKey } from "@repo/db/schema";
import { eq } from "@repo/db";

import { protectedProcedure } from "../trpc";

export const vaultKeyRouter = {
  createVaultKey: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        key: z.string(),
        iv: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, key, iv } = input;
      if (!userId || !key || !iv) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required fields",
        });
      }
      const { db } = ctx;
      const vaultKeyData = await db
        .insert(vaultKey)
        .values({
          userId,
          key,
          iv,
        })
        .returning();

      return { success: true, vaultKeyData };
    }),

  getVaultKey: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
        const { userId } = input;
        if (!userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "UserId is required",
          });
        }

      const { db } = ctx;
      const vaultKeyData = await db.query.vaultKey.findFirst({
        where: eq(vaultKey.userId, userId),
      });
      if (!vaultKeyData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vault key not found",
        });
      }
      return { success: true, vaultKeyData };
    }),
};
