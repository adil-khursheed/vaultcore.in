import type { MetadataRoute } from "next";

// The product app is never indexed; the marketing site owns search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
