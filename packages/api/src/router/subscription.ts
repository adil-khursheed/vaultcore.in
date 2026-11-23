import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { getOrgPlan } from "@repo/auth/entitlements";
import { eq } from "@repo/db";
import { organizationSubscriptions } from "@repo/db/schema";

import { orgMemberProcedure, protectedProcedure } from "../trpc";

export const subscriptionRouter = {
  getAllPlans: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.plans.findMany();
  }),
  /**
   * Get the current plan and subscription details for an organization
   */
  getCurrentActivePlan: orgMemberProcedure
    .input(z.object({ organizationId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const orgId =
        input.organizationId ?? ctx.session.session.activeOrganizationId;

      if (!orgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization specified.",
        });
      }

      const plan = await getOrgPlan(orgId);

      // Also fetch detailed subscription data if it exists
      const subscription =
        await ctx.db.query.organizationSubscriptions.findFirst({
          where: eq(organizationSubscriptions.organizationId, orgId),
          with: {
            plan: true,
          },
        });

      return {
        plan,
        subscription,
      };
    }),
};
