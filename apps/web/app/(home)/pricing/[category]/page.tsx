import type { Metadata } from "next";
import React from "react";
import Pricing from "@/components/shared/pricing";
import SectionContainer from "@/components/shared/section-container";

import CategoryTab from "./_components/category-tab";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "VaultCore pricing for individuals, families, and small teams. Start free with zero-knowledge encryption, then upgrade for more organizations and members.",
  alternates: {
    canonical: "/pricing/personal",
  },
  openGraph: {
    title: "VaultCore pricing",
    description:
      "Start free with zero-knowledge encryption. Upgrade for more organizations and members.",
  },
};

const Page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params;

  return (
    <SectionContainer>
      <div className="flex flex-col items-center justify-center gap-10 px-4 py-16 md:py-24">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="text-foreground text-3xl font-bold text-balance md:text-5xl">
            Simple pricing. Serious privacy.
          </h1>

          <p className="text-muted-foreground text-base text-pretty md:text-lg">
            Every plan includes zero-knowledge encryption. Start free, then add
            organizations and members as your circle grows.
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
  );
};

export default Page;
