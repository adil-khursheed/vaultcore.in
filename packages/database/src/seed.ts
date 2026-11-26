import { sql } from "drizzle-orm";

import { db } from "./client";
import type { PlanEntitlements } from "./schema";
import { DEFAULT_FREE_ENTITLEMENTS, plans } from "./schema";

const PLANS: Array<{
  id: string;
  name: string;
  description: string;
  polarProductId: string | undefined;
  yearlyPriceUsd: number;
  maxOrgsPerUser: number | null;
  maxMembersPerOrg: number | null;
  isPopular: boolean;
  entitlements: PlanEntitlements;
  features: string[];
}> = [
  {
    id: "free",
    name: "Free",
    description: "Secure personal vault with bank-grade encryption.",
    polarProductId: process.env.POLAR_FREE_PRODUCT_ID,
    yearlyPriceUsd: 0,
    maxOrgsPerUser: 1,
    maxMembersPerOrg: 2,
    isPopular: false,
    entitlements: DEFAULT_FREE_ENTITLEMENTS,
    features: [
      "1 organization",
      "2 members per org",
      "Unlimited items & devices",
      "TOTP authenticator codes",
      "CSV import & export",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced security and collaboration for professionals.",
    polarProductId: process.env.POLAR_PREMIUM_PRODUCT_ID,
    yearlyPriceUsd: 1299, // $12.99
    maxOrgsPerUser: 2,
    maxMembersPerOrg: 3,
    isPopular: true,
    entitlements: {
      totp: true,
      csvExport: true,
      healthReports: true,
      prioritySupport: true,
      auditRetentionDays: 90,
    },
    features: [
      "2 organizations",
      "3 members per org",
      "Everything in Free",
      "Password health dashboard",
      "Priority email support",
    ],
  },
  {
    id: "family",
    name: "Family",
    description: "Organization-wide security for your entire household.",
    polarProductId: process.env.POLAR_FAMILY_PRODUCT_ID,
    yearlyPriceUsd: 5999, // $59.99
    maxOrgsPerUser: null, // unlimited
    maxMembersPerOrg: 10,
    isPopular: false,
    entitlements: {
      totp: true,
      csvExport: true,
      healthReports: true,
      prioritySupport: true,
      auditRetentionDays: 90,
    },
    features: [
      "Unlimited organizations",
      "10 members per org",
      "Everything in Premium",
      "Shared household vault",
      "Family password health dashboard",
    ],
  },
];

async function main() {
  console.log("Seeding plans...");
  for (const plan of PLANS) {
    await db
      .insert(plans)
      .values(plan)
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          name: plan.name,
          description: plan.description,
          polarProductId: plan.polarProductId,
          yearlyPriceUsd: plan.yearlyPriceUsd,
          maxOrgsPerUser: plan.maxOrgsPerUser,
          maxMembersPerOrg: plan.maxMembersPerOrg,
          isPopular: sql`excluded."is_popular"`,
          entitlements: plan.entitlements,
          features: plan.features,
        },
      });
  }
  console.log("Plans seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
