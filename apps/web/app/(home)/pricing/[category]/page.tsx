import React from "react";
import SectionContainer from "@/components/shared/section-container";

import CategoryTab from "./_components/category-tab";
import Pricing from "./_components/pricing";

const Page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params;

  return (
    <SectionContainer>
      <div className="flex flex-col items-center justify-center gap-8 py-12">
        <h1 className="mb-0 text-center text-2xl font-medium text-balance md:text-5xl">
          Our Pricing
        </h1>

        <p className="text-muted-foreground mx-auto w-full max-w-xl text-center text-base md:text-lg">
          Save, sort and share passwords with family or work colleagues on
          different accounts using a single online identity.
        </p>

        <CategoryTab category={category} />

        <Pricing />
      </div>
    </SectionContainer>
  );
};

export default Page;
