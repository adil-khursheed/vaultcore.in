import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { getOrgPlan } from "@repo/auth/entitlements";
import { desc, eq } from "@repo/db";
import { organizationSubscriptions, payments, plans } from "@repo/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const subscriptionRouter = createTRPCRouter({
  getAllPlans: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.plans.findMany();
  }),
  /**
   * Get the current plan and subscription details for an organization
   */
  getCurrentActivePlan: protectedProcedure
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

  /**
   * List payment history for an organization
   */
  listPayments: protectedProcedure
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

      return await ctx.db.query.payments.findMany({
        where: eq(payments.organizationId, orgId),
        orderBy: [desc(payments.createdAt)],
      });
    }),

  /**
   * Get a Polar checkout URL for a specific plan
   */
  getCheckoutUrl: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        organizationId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const orgId =
        input.organizationId ?? ctx.session.session.activeOrganizationId;

      if (!orgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No organization specified.",
        });
      }

      const plan = await ctx.db.query.plans.findFirst({
        where: eq(plans.id, input.planId),
      });

      if (!plan || !plan.polarProductId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found or not available for checkout.",
        });
      }

      // We use the Better Auth Polar plugin's checkout endpoint internally or
      // redirect the user to the auth API's checkout route.
      // Better Auth adds a /checkout endpoint.

      // Since we are in a tRPC procedure, we can return the URL for the frontend to redirect to.
      // The Better Auth Polar plugin expects a POST to /checkout with the slug.

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      // We can generate the checkout URL using the Polar SDK directly if needed,
      // but the Better Auth plugin handles linking the customer to the user.

      // The frontend should ideally call the auth API directly, but we can provide
      // a helper redirect URL here.

      return {
        url: `/api/auth/checkout`,
        method: "POST",
        body: {
          slug: plan.id, // Better Auth uses 'slug' from the plugin config
          referenceId: orgId,
          metadata: {
            organizationId: orgId,
            userId: ctx.session.user.id,
          },
        },
      };
    }),
});
