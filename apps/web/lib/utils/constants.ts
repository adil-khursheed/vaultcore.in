export const pricingCategories = [
  { value: "personal", label: "Personal" },
] as const;

export type PricingCategory = (typeof pricingCategories)[number]["value"];

export const isPricingCategory = (value: string): value is PricingCategory => {
  return pricingCategories.some((category) => category.value === value);
};

export const plans = [
  {
    id: "free",
    name: "Free",
    yearlyPriceUsd: 0,
    description: "A private, encrypted vault for one person. Free to keep.",
    features: [
      "1 organization",
      "2 members per org",
      "End-to-end encryption",
      "Zero-knowledge architecture",
      "Unlimited devices & sync",
    ],
    cta: "Create free vault",
    isPopular: false,
  },
  {
    id: "premium",
    name: "Premium",
    yearlyPriceUsd: 1000,
    description:
      "More organizations and members for work, side projects, and family.",
    features: [
      "2 organizations",
      "3 members per org",
      "Everything in Free",
      "Priority email support",
      "Advanced vault items",
    ],
    cta: "Choose Premium",
    isPopular: true,
  },
  {
    id: "family",
    name: "Family",
    yearlyPriceUsd: 4999,
    description: "One shared vault for the whole household, with room to grow.",
    features: [
      "Unlimited organizations",
      "10 members per org",
      "Everything in Premium",
      "Household sharing",
      "Family security dashboard",
    ],
    cta: "Choose Family",
    isPopular: false,
  },
];
