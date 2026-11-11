import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq, inArray } from "@repo/db";
import { member, memberVaultKey, user, vaultKey } from "@repo/db/schema";

import { logAuditEvent } from "../lib/audit";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const migrationRouter = createTRPCRouter({
  /**
   * Updates the user's record with their newly generated RSA keys
   * and public key fingerprint during the migration flow.
   */
  migrateUserKeys: protectedProcedure
    .input(
      z.object({
        publicKey: z.string(),
        encryptedPrivateKey: z.string(),
        privateKeyIv: z.string(),
        publicKeyFingerprint: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        publicKey,
        encryptedPrivateKey,
        privateKeyIv,
        publicKeyFingerprint,
      } = input;

      const userId = ctx.session.user.id;

      await ctx.db
        .update(user)
        .set({
          publicKey,
          encryptedPrivateKey,
          privateKeyIv,
          publicKeyFingerprint,
        })
        .where(eq(user.id, userId));

      return { success: true };
    }),

  /**
   * Retrieves all legacy AES-GCM vault keys from the deprecated `vaultKey` table
   * for organizations the user administers.
   */
  getLegacyVaultKeys: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const legacyKeys = await ctx.db
      .select({
        id: vaultKey.id,
        key: vaultKey.key,
        iv: vaultKey.iv,
        organizationId: vaultKey.organizationId,
        role: member.role,
      })
      .from(vaultKey)
      .innerJoin(member, eq(vaultKey.organizationId, member.organizationId))
      .where(
        and(
          eq(member.userId, userId),
          inArray(member.role, ["owner", "admin"]),
        ),
      );

    return { success: true, legacyKeys };
  }),

  /**
   * Bulk-inserts new RSA-wrapped vault keys for legacy organizations.
   * Also handles auditing the migration event.
   */
  migrateLegacyVaultKeys: protectedProcedure
    .input(
      z.object({
        keys: z.array(
          z.object({
            organizationId: z.string(),
            encryptedKey: z.string(),
            status: z.enum(["active", "pending"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { keys } = input;

      if (keys.length === 0) return { success: true };

      // Verify the user administers these organizations
      const orgIds = keys.map((k) => k.organizationId);
      const memberships = await ctx.db.query.member.findMany({
        where: and(
          eq(member.userId, userId),
          inArray(member.organizationId, orgIds),
          inArray(member.role, ["owner", "admin"]),
        ),
      });

      const memberOrgIds = new Set(memberships.map((m) => m.organizationId));

      // Filter to only orgs they administer
      const validKeys = keys.filter((k) => memberOrgIds.has(k.organizationId));

      if (validKeys.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not administer any of the specified organizations",
        });
      }

      // Upsert each key individually for safe per-org conflict handling
      for (const k of validKeys) {
        await ctx.db
          .insert(memberVaultKey)
          .values({
            organizationId: k.organizationId,
            userId: userId,
            encryptedKey: k.encryptedKey,
            status: k.status,
            grantedBy: userId, // self-migrated
          })
          .onConflictDoUpdate({
            target: [memberVaultKey.organizationId, memberVaultKey.userId],
            set: {
              encryptedKey: k.encryptedKey,
              status: k.status,
              grantedBy: userId,
            },
          });
      }

      logAuditEvent({
        actorUserId: userId,
        targetUserId: userId,
        action: "user_keys_migrated",
        metadata: { organizationsMigrated: validKeys.length },
      });

      return { success: true, count: validKeys.length };
    }),
});
