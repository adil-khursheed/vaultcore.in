import { db } from "./client";
import { plans } from "./schema";

const PLANS = [
  {
    id: "free",
    name: "Free",
    polarProductId: process.env.POLAR_FREE_PRODUCT_ID,
    yearlyPriceUsd: 0,
    maxOrgsPerUser: 1,
    maxMembersPerOrg: 2,
    features: ["1 organization", "2 members per org"],
  },
  {
    id: "premium",
    name: "Premium",
    polarProductId: process.env.POLAR_PREMIUM_PRODUCT_ID,
    yearlyPriceUsd: 1000, // $10.00
    maxOrgsPerUser: 2,
    maxMembersPerOrg: 3,
    features: ["2 organizations", "3 members per org"],
  },
  {
    id: "family",
    name: "Family",
    polarProductId: process.env.POLAR_FAMILY_PRODUCT_ID,
    yearlyPriceUsd: 4999, // $49.99
    maxOrgsPerUser: null, // unlimited
    maxMembersPerOrg: 10,
    features: ["Unlimited organizations", "10 members per org"],
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
          polarProductId: plan.polarProductId,
          yearlyPriceUsd: plan.yearlyPriceUsd,
          maxOrgsPerUser: plan.maxOrgsPerUser,
          maxMembersPerOrg: plan.maxMembersPerOrg,
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
