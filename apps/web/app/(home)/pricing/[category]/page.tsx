import React from "react";

import SectionContainer from "../../_components/section-container";
import CategoryTab from "./_components/category-tab";
import Pricing from "./_components/pricing";

const Page = async ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = await params;

  return (
    <SectionContainer className="text-foreground relative mx-auto w-full max-w-6xl">
      <div className="to-border absolute top-0 left-0 z-10 h-full w-px bg-linear-to-b from-transparent via-20%" />
      <div className="to-border absolute top-0 right-0 z-10 h-full w-px bg-linear-to-b from-transparent via-20%" />

      <section className="flex flex-col items-center justify-center gap-8 py-12">
        <h1 className="mb-0 text-center text-2xl font-medium text-balance md:text-5xl">
          Our Pricing
        </h1>

        <p className="text-muted-foreground mx-auto w-full max-w-xl text-center text-base md:text-lg">
          Save, sort and share passwords with family or work colleagues on
          different accounts using a single online identity.
        </p>

        <CategoryTab category={category} />

        <Pricing />
      </section>
    </SectionContainer>
  );
};

export default Page;
