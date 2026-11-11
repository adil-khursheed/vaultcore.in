import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, lt } from "@repo/db";
import { credential } from "@repo/db/schema";

import { logAuditEvent } from "../lib/audit";
import { orgVaultProcedure } from "../trpc";

export const credentialRouter = {
  /**
   * Fetch credentials for the current user's organization.
   * Org membership and active vault access are verified by the orgVaultProcedure middleware.
   */
  getCredentials: orgVaultProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        type: z
          .enum(["login", "card", "identity", "note", "ssh_key"])
          .optional(),
        isFavorite: z.boolean().optional(),
        isDeleted: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.uuid().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const { organizationId, type, limit, cursor, isFavorite, isDeleted } =
        input;

      const whereClause = and(
        eq(credential.organizationId, organizationId),
        eq(credential.isDeleted, isDeleted),
        type ? eq(credential.type, type) : undefined,
        isFavorite != null ? eq(credential.isFavorite, isFavorite) : undefined,
        cursor ? lt(credential.id, cursor) : undefined,
      );

      const items = await db.query.credential.findMany({
        where: whereClause,
        orderBy: [desc(credential.createdAt), desc(credential.id)],
        limit: limit + 1,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  /**
   * Create a new credential.
   * Org membership and active vault access are verified by the orgVaultProcedure middleware.
   */
  create: orgVaultProcedure
    .input(
      z.object({
        title: z.string().min(1),
        username: z.string().optional(),
        password: z.string().optional(),
        url: z.string().optional(),
        note: z.string().optional(),
        type: z
          .enum(["login", "card", "identity", "note", "ssh_key"])
          .default("login"),
        data: z.record(z.string(), z.any()).optional(),
        organizationId: z.string().min(1),
        otp: z.string().optional(),
        isFavorite: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const [newCredential] = await db
        .insert(credential)
        .values({
          ...input,
        })
        .returning();

      logAuditEvent({
        actorUserId: ctx.session.user.id,
        organizationId: input.organizationId,
        action: "credential_created",
        metadata: { credentialId: newCredential!.id, type: input.type },
      });

      return newCredential!;
    }),

  /**
   * Update an existing credential.
   * Org membership and active vault access are verified by the orgVaultProcedure middleware.
   */
  update: orgVaultProcedure
    .input(
      z.object({
        id: z.uuid().min(1),
        organizationId: z.string().min(1),
        title: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        url: z.string().optional(),
        note: z.string().optional(),
        type: z
          .enum(["login", "card", "identity", "note", "ssh_key"])
          .optional(),
        data: z.record(z.string(), z.any()).optional(),
        otp: z.string().optional(),
        isFavorite: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, organizationId, ...updateData } = input;

      const [updatedCredential] = await db
        .update(credential)
        .set(updateData)
        .where(
          and(
            eq(credential.id, id),
            eq(credential.organizationId, organizationId),
          ),
        )
        .returning();

      if (!updatedCredential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found or you don't have access",
        });
      }

      logAuditEvent({
        actorUserId: ctx.session.user.id,
        organizationId,
        action: "credential_updated",
        metadata: { credentialId: id },
      });

      return updatedCredential;
    }),

  /**
   * Batch create credentials.
   * Org membership and active vault access are verified by the orgVaultProcedure middleware.
   */
  batchCreate: orgVaultProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        credentials: z.array(
          z.object({
            title: z.string().min(1),
            username: z.string().optional(),
            password: z.string().optional(),
            url: z.string().optional(),
            note: z.string().optional(),
            type: z
              .enum(["login", "card", "identity", "note", "ssh_key"])
              .default("login"),
            data: z.record(z.string(), z.any()).optional(),
            otp: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { organizationId, credentials: credentialsData } = input;

      const values = credentialsData.map((cred) => ({
        ...cred,
        organizationId,
      }));

      const newCredentials = await db
        .insert(credential)
        .values(values)
        .returning();

      logAuditEvent({
        actorUserId: ctx.session.user.id,
        organizationId,
        action: "credential_created",
        metadata: { count: newCredentials.length, batch: true },
      });

      return newCredentials;
    }),
};
