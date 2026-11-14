import type { MetadataRoute } from "next";
import { pricingCategories } from "@/lib/constants";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pricingCategories.map((category) => ({
      url: `${siteUrl}/pricing/${category.value}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
