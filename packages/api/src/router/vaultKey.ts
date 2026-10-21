import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@repo/db";
import {
  credential,
  member,
  memberVaultKey,
  user,
  vaultKeyRotationLog,
} from "@repo/db/schema";

import { logAuditEvent } from "../lib/audit";
import {
  orgAdminProcedure,
  orgMemberProcedure,
  protectedProcedure,
} from "../trpc";

export const vaultKeyRouter = {
  /**
   * Grant vault access to a user in an organization.
   * Only admins/owners can grant access. Inserts or updates the memberVaultKey row
   * with the RSA-wrapped vault key.
   */
  grantVaultAccess: orgAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
        encryptedKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, userId, encryptedKey } = input;

      // Verify the target user is a member of the organization
      const targetMember = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      });

      if (!targetMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target user is not a member of this organization",
        });
      }

      const vaultKeyData = await ctx.db
        .insert(memberVaultKey)
        .values({
          organizationId,
          userId,
          encryptedKey,
          status: "active",
          grantedBy: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: [memberVaultKey.organizationId, memberVaultKey.userId],
          set: {
            encryptedKey,
            status: "active",
            grantedBy: ctx.session.user.id,
          },
        })
        .returning();

      logAuditEvent({
        actorUserId: ctx.session.user.id,
        targetUserId: userId,
        organizationId,
        action: "vault_key_granted",
        metadata: {},
      });

      return { success: true, vaultKeyData };
    }),

  /**
   * Self-grant vault access — used during signup and org creation
   * where the user is granting access to themselves as the new owner.
   * Requires the caller to be the same user as the target.
   */
  selfGrantVaultAccess: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
        encryptedKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, userId, encryptedKey } = input;

      // Only allow self-granting
      if (userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You can only grant vault access to yourself via this endpoint",
        });
      }

      // Verify the user is a member (owner) of the organization
      const memberRecord = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      });

      if (!memberRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this organization",
        });
      }

      const vaultKeyData = await ctx.db
        .insert(memberVaultKey)
        .values({
          organizationId,
          userId,
          encryptedKey,
          status: "active",
          grantedBy: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: [memberVaultKey.organizationId, memberVaultKey.userId],
          set: {
            encryptedKey,
            status: "active",
            grantedBy: ctx.session.user.id,
          },
        })
        .returning();

      logAuditEvent({
        actorUserId: ctx.session.user.id,
        targetUserId: userId,
        organizationId,
        action: "vault_key_granted",
        metadata: { selfGrant: true },
      });

      return { success: true, vaultKeyData };
    }),

  /**
   * Get the calling user's vault key for a specific organization.
   * Membership is verified by the orgMemberProcedure middleware.
   */
  getMyVaultKey: orgMemberProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;

      const vaultKeyData = await ctx.db.query.memberVaultKey.findFirst({
        where: and(
          eq(memberVaultKey.organizationId, organizationId),
          eq(memberVaultKey.userId, ctx.session.user.id),
        ),
      });

      if (!vaultKeyData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vault key not found for user in this organization",
        });
      }
      return { success: true, vaultKeyData };
    }),

  /**
   * Get pending members who need vault access granted.
   * Only admins/owners can see pending members.
   */
  getPendingMembers: orgAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;

      const pendingMembers = await ctx.db
        .select({
          id: memberVaultKey.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          publicKey: user.publicKey,
          publicKeyFingerprint: user.publicKeyFingerprint,
        })
        .from(memberVaultKey)
        .innerJoin(user, eq(memberVaultKey.userId, user.id))
        .where(
          and(
            eq(memberVaultKey.organizationId, organizationId),
            eq(memberVaultKey.status, "pending"),
          ),
        );

      return { success: true, pendingMembers };
    }),

  /**
   * Get active members who have vault access.
   * Only admins/owners can see active members.
   */
  getActiveMembers: orgAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;

      const activeMembers = await ctx.db
        .select({
          id: memberVaultKey.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          publicKey: user.publicKey,
          publicKeyFingerprint: user.publicKeyFingerprint,
          vaultKeyStatus: memberVaultKey.status,
        })
        .from(memberVaultKey)
        .innerJoin(user, eq(memberVaultKey.userId, user.id))
        .where(
          and(
            eq(memberVaultKey.organizationId, organizationId),
            eq(memberVaultKey.status, "active"),
          ),
        );

      return { success: true, items: activeMembers };
    }),

  /**
   * Get a member's public key for vault key wrapping.
   * Scoped to same-org membership — caller must be in the same org as the target.
   */
  getMemberPublicKey: orgMemberProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, organizationId } = input;

      // Verify the target user is also a member of this org
      const targetMember = await ctx.db.query.member.findFirst({
        where: and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId),
        ),
      });

      if (!targetMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is not a member of this organization",
        });
      }

      const targetUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!targetUser || !targetUser.publicKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User or public key not found",
        });
      }
      return { success: true, publicKey: targetUser.publicKey };
    }),

  /**
   * Get rotation logs for an organization.
   * Only admins can view the rotation history.
   */
  getRotationLogs: orgAdminProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.query.vaultKeyRotationLog.findMany({
        where: eq(vaultKeyRotationLog.organizationId, input.organizationId),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: 50,
      });
      return { success: true, logs };
    }),

  /**
   * Rotate the organization's vault key.
   * This endpoint replaces all member vault keys and all credential data in a single transaction.
   * Only admins/owners can perform this action.
   */
  rotateVaultKey: orgAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        newMemberKeys: z.array(
          z.object({
            userId: z.string(),
            encryptedKey: z.string(),
          }),
        ),
        reEncryptedCredentials: z.array(
          z.object({
            id: z.string(),
            username: z.string().nullish(),
            password: z.string().nullish(),
            url: z.string().nullish(),
            otp: z.string().nullish(),
            note: z.string().nullish(),
            data: z.record(z.string(), z.any()).nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, newMemberKeys, reEncryptedCredentials } = input;
      const currentUserId = ctx.session.user.id;

      // Ensure the transaction covers the updates
      await ctx.db.transaction(async (tx: any) => {
        // 1. Get the current max version to increment
        const currentKeys = await tx.query.memberVaultKey.findMany({
          where: eq(memberVaultKey.organizationId, organizationId),
          limit: 1,
        });
        const currentVersion =
          currentKeys.length > 0 ? currentKeys[0].keyVersion : 1;
        const newVersion = currentVersion + 1;

        // 2. Update credentials
        for (const cred of reEncryptedCredentials) {
          await tx
            .update(credential)
            .set({
              username: cred.username ?? null,
              password: cred.password ?? null,
              url: cred.url ?? null,
              otp: cred.otp ?? null,
              note: cred.note ?? null,
              data: cred.data ?? null,
            })
            .where(
              and(
                eq(credential.id, cred.id),
                eq(credential.organizationId, organizationId),
              ),
            );
        }

        // 3. Update member keys
        for (const memberKey of newMemberKeys) {
          await tx
            .update(memberVaultKey)
            .set({
              encryptedKey: memberKey.encryptedKey,
              keyVersion: newVersion,
              rotatedAt: new Date(),
            })
            .where(
              and(
                eq(memberVaultKey.userId, memberKey.userId),
                eq(memberVaultKey.organizationId, organizationId),
              ),
            );
        }

        // 4. Record rotation event
        await tx.insert(vaultKeyRotationLog).values({
          organizationId,
          initiatedBy: currentUserId,
          previousVersion: currentVersion,
          newVersion: newVersion,
          membersRotated: newMemberKeys.length,
        });
      });

      // Non-blocking audit log
      logAuditEvent({
        actorUserId: currentUserId,
        targetUserId: null,
        organizationId: organizationId,
        action: "vault_key_rotated",
        metadata: {
          membersCount: newMemberKeys.length,
          credentialsCount: reEncryptedCredentials.length,
        },
      });

      return { success: true };
    }),
};
