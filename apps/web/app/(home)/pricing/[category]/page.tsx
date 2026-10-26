import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import Pricing from "@/components/shared/pricing";
import SectionContainer from "@/components/shared/section-container";
import StructuredData from "@/components/shared/structured-data";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";
import {
  isPricingCategory,
  plans,
  pricingCategories,
} from "@/lib/utils/constants";

import CategoryTab from "./_components/category-tab";

export const dynamicParams = false;

export function generateStaticParams() {
  return pricingCategories.map((category) => ({ category: category.value }));
}

const title = "Pricing";
const description =
  "VaultCore pricing for individuals, families, and small teams. Start free with zero-knowledge encryption, then upgrade for more organizations and members.";

type PageProps = {
  params: Promise<{ category: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { category } = await params;
  const canonicalPath = `/pricing/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: "VaultCore pricing",
      description,
      url: canonicalPath,
      type: "website",
      siteName: site.name,
      locale: site.locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "VaultCore pricing",
      description,
      site: site.twitterHandle,
      images: [twitterImage],
    },
  };
};

const getStructuredData = (pricingUrl: string) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": `${pricingUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pricing",
          item: pricingUrl,
        },
      ],
    },
    {
      "@type": "Product",
      "@id": `${pricingUrl}#product`,
      name: site.name,
      description:
        "A zero-knowledge password manager and digital vault for individuals, families, and small teams.",
      image: absoluteUrl(ogImage.url),
      url: pricingUrl,
      brand: {
        "@type": "Brand",
        name: site.name,
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: (
          Math.min(...plans.map((plan) => plan.yearlyPriceUsd)) / 100
        ).toFixed(2),
        highPrice: (
          Math.max(...plans.map((plan) => plan.yearlyPriceUsd)) / 100
        ).toFixed(2),
        offerCount: plans.length,
        priceCurrency: "USD",
        url: pricingUrl,
        offers: plans.map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: (plan.yearlyPriceUsd / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: pricingUrl,
        })),
      },
    },
  ],
});

const Page = async ({ params }: PageProps) => {
  const { category } = await params;

  if (!isPricingCategory(category)) {
    notFound();
  }

  const pricingUrl = absoluteUrl(`/pricing/${category}`);

  return (
    <>
      <StructuredData data={getStructuredData(pricingUrl)} />

      <SectionContainer>
        <div className="flex flex-col items-center justify-center gap-10 px-4 py-16 md:py-24">
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
            <h1 className="text-foreground text-3xl font-bold text-balance md:text-5xl">
              Simple pricing. Serious privacy.
            </h1>

            <p className="text-muted-foreground text-base text-pretty md:text-lg">
              Every plan includes zero-knowledge encryption. Start free, then
              add organizations and members as your circle grows.
            </p>
          </div>

          <h2 className="sr-only">Plans</h2>

          <CategoryTab category={category} />

          <Pricing />

          <p className="text-muted-foreground text-center text-xs">
            Prices in USD, billed yearly. Cancel anytime.
          </p>
        </div>
      </SectionContainer>
    </>
  );
};

export default Page;
