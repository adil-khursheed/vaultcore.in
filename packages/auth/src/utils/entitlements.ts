import { APIError } from "better-auth/api";

import { and, count, eq, gt } from "@repo/db";
import { db } from "@repo/db/client";
import {
  DEFAULT_FREE_ENTITLEMENTS,
  invitation,
  member,
  organizationSubscriptions,
  plans,
  type PlanEntitlements,
} from "@repo/db/schema";

import { env } from "../../env.ts";

export type Plan = typeof plans.$inferSelect;
export type EntitlementKey = keyof PlanEntitlements;

export const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  polarProductId: env.POLAR_FREE_PRODUCT_ID,
  description: "Secure personal vault with bank-grade encryption.",
  isPopular: false,
  yearlyPriceUsd: 0,
  maxOrgsPerUser: 1,
  maxMembersPerOrg: 2,
  entitlements: DEFAULT_FREE_ENTITLEMENTS,
  features: [
    "1 organization",
    "2 members per org",
    "Unlimited items & devices",
    "TOTP authenticator codes",
    "CSV import & export",
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
 * Check if an org can create another invitation.
 * Counts current members plus unexpired pending invitations so a plan cannot
 * be exceeded by sending more invites than there are open seats.
 */
export async function canInviteMember(
  organizationId: string,
): Promise<boolean> {
  const plan = await getOrgPlan(organizationId);
  if (plan.maxMembersPerOrg === null) return true;

  const [currentMembers, pendingInvitations] = await Promise.all([
    db
      .select({ value: count() })
      .from(member)
      .where(eq(member.organizationId, organizationId)),
    db
      .select({ value: count() })
      .from(invitation)
      .where(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      ),
  ]);

  const occupiedSeats =
    (currentMembers[0]?.value ?? 0) + (pendingInvitations[0]?.value ?? 0);

  return occupiedSeats < plan.maxMembersPerOrg;
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

export async function hasEntitlement(
  organizationId: string,
  key: EntitlementKey,
): Promise<boolean> {
  const plan = await getOrgPlan(organizationId);
  return Boolean(plan.entitlements?.[key]);
}

export async function assertEntitlement(
  organizationId: string,
  key: EntitlementKey,
): Promise<void> {
  if (!(await hasEntitlement(organizationId, key))) {
    throw new APIError("FORBIDDEN", {
      message: `Your current plan does not include "${key}". Please upgrade to continue.`,
    });
  }
}
