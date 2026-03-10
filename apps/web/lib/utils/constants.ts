import { env } from "@/env";

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free forever",
    description: "Secure personal vault with bank-grade encryption.",
    features: [
      "1 organization",
      "2 members per org",
      "End-to-end encryption",
      "Zero-knowledge architecture",
      "Unlimited devices & sync",
    ],
    cta: "Get started",
  },
  {
    id: "premium",
    name: "Premium",
    price: 10,
    description: "Advanced security and collaboration for professionals.",
    features: [
      "2 organizations",
      "3 members per org",
      "Everything in Free",
      "Priority email support",
      "Advanced vault items",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "family",
    name: "Family",
    price: 49.99,
    description: "Organization-wide security for your entire household.",
    features: [
      "Unlimited organizations",
      "10 members per org",
      "Everything in Premium",
      "Household sharing",
      "Family security dashboard",
    ],
    cta: "Get Started",
  },
];
