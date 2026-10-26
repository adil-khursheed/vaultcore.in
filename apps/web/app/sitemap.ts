import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { pricingCategories } from "@/lib/utils/constants";

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
