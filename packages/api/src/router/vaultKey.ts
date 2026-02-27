import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@repo/db";
import { vaultKey } from "@repo/db/schema";

import { protectedProcedure } from "../trpc";

export const vaultKeyRouter = {
  createVaultKey: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        key: z.string(),
        iv: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, key, iv } = input;
      if (!organizationId || !key || !iv) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required fields",
        });
      }
      const { db } = ctx;
      const vaultKeyData = await db
        .insert(vaultKey)
        .values({
          organizationId,
          key,
          iv,
        })
        .returning();

      return { success: true, vaultKeyData };
    }),

  getVaultKey: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;
      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "OrganizationId is required",
        });
      }

      const { db } = ctx;
      const vaultKeyData = await db.query.vaultKey.findFirst({
        where: eq(vaultKey.organizationId, organizationId),
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
