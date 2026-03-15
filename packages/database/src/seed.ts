import { sql } from "drizzle-orm";

import { db } from "./client";
import { plans } from "./schema";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Secure personal vault with bank-grade encryption.",
    polarProductId: process.env.POLAR_FREE_PRODUCT_ID,
    yearlyPriceUsd: 0,
    maxOrgsPerUser: 1,
    maxMembersPerOrg: 2,
    isPopular: false,
    features: [
      "1 organization",
      "2 members per org",
      "End-to-end encryption",
      "Zero-knowledge architecture",
      "Unlimited devices & sync",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced security and collaboration for professionals.",
    polarProductId: process.env.POLAR_PREMIUM_PRODUCT_ID,
    yearlyPriceUsd: 1000, // $10.00
    maxOrgsPerUser: 2,
    maxMembersPerOrg: 3,
    isPopular: true,
    features: [
      "2 organizations",
      "3 members per org",
      "Everything in Free",
      "Priority email support",
      "Advanced vault items",
    ],
  },
  {
    id: "family",
    name: "Family",
    description: "Organization-wide security for your entire household.",
    polarProductId: process.env.POLAR_FAMILY_PRODUCT_ID,
    yearlyPriceUsd: 4999, // $49.99
    maxOrgsPerUser: null, // unlimited
    maxMembersPerOrg: 10,
    isPopular: false,
    features: [
      "Unlimited organizations",
      "10 members per org",
      "Everything in Premium",
      "Household sharing",
      "Family security dashboard",
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
