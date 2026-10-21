import { z } from "zod/v4";
import { desc, eq, and, lt } from "@repo/db";
import { auditLog } from "@repo/db/schema";
import { createTRPCRouter, orgAdminProcedure } from "../trpc";

export const auditRouter = createTRPCRouter({
  /**
   * Fetch audit logs for an organization.
   * Only admins/owners can view the audit logs.
   */
  getAuditLog: orgAdminProcedure
    .input(
      z.object({
        organizationId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        pageCursor: z.string().uuid().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { organizationId, limit, pageCursor } = input;

      const items = await ctx.db.query.auditLog.findMany({
        where: and(
          eq(auditLog.organizationId, organizationId),
          pageCursor ? lt(auditLog.id, pageCursor) : undefined,
        ),
        orderBy: [desc(auditLog.createdAt), desc(auditLog.id)],
        limit: limit + 1,
      });

      let nextCursor: typeof pageCursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
