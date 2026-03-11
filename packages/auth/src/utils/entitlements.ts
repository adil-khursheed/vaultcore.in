import { and, count, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { member, organizationSubscriptions, plans } from "@repo/db/schema";

import { env } from "../../env.ts";

export type Plan = typeof plans.$inferSelect;

export const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  polarProductId: env.POLAR_FREE_PRODUCT_ID,
  description: "Secure personal vault with bank-grade encryption.",
  isPopular: false,
  yearlyPriceUsd: 0,
  maxOrgsPerUser: 1,
  maxMembersPerOrg: 2,
  features: [
    "1 organization",
    "2 members per org",
    "End-to-end encryption",
    "Zero-knowledge architecture",
    "Unlimited devices & sync",
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Get the active plan for an org. Falls back to the free plan constant if no paid row.
 */
export async function getOrgPlan(organizationId: string): Promise<Plan> {
  const subscription = await db.query.organizationSubscriptions.findFirst({
    where: eq(organizationSubscriptions.organizationId, organizationId),
    with: {
      plan: true,
    },
  });

  if (!subscription || !subscription.plan) {
    return FREE_PLAN;
  }

  return subscription.plan;
}

/**
 * Check if an org can add another member (enforces maxMembersPerOrg)
 */
export async function canAddMember(organizationId: string): Promise<boolean> {
  const plan = await getOrgPlan(organizationId);
  if (plan.maxMembersPerOrg === null) return true;

  const currentMembers = await db
    .select({ value: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId));

  return (currentMembers[0]?.value ?? 0) < plan.maxMembersPerOrg;
}

/**
 * Check if a user can create another org (enforces maxOrgsPerUser across all orgs they own)
 */
export async function canCreateOrg(userId: string): Promise<boolean> {
  // Find the user's highest tier plan across all orgs they own
  const ownedOrgs = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.role, "owner")));

  if (ownedOrgs.length === 0) return true; // Can always create first org

  let highestLimit: number | null = 0;

  for (const org of ownedOrgs) {
    const plan = await getOrgPlan(org.organizationId);
    if (plan.maxOrgsPerUser === null) return true; // Unlimited
    if (plan.maxOrgsPerUser > (highestLimit ?? 0)) {
      highestLimit = plan.maxOrgsPerUser;
    }
  }

  return ownedOrgs.length < (highestLimit ?? 1);
}

/**
 * Convenience: resolve plan limits directly
 */
export async function getOrgLimits(organizationId: string) {
  const plan = await getOrgPlan(organizationId);
  const subscription = await db.query.organizationSubscriptions.findFirst({
    where: eq(organizationSubscriptions.organizationId, organizationId),
  });

  return {
    maxMembersPerOrg: plan.maxMembersPerOrg,
    maxOrgsPerUser: plan.maxOrgsPerUser,
    planId: plan.id,
    status: subscription?.status ?? "free",
  };
}
