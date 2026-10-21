import React from "react";
import Pricing from "@/components/shared/pricing";
import SectionContainer from "@/components/shared/section-container";

const PricingSection = () => {
  return (
    <SectionContainer id="pricing" className="min-h-auto scroll-mt-20 py-24">
      <div className="border_bottom flex flex-col items-center gap-12 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            id="pricing-heading"
            className="text-foreground text-3xl font-bold text-balance md:text-5xl"
          >
            Pricing that starts free.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base text-pretty md:text-lg">
            Every plan includes zero-knowledge encryption. Upgrade when you need
            more organizations and members.
          </p>
        </div>

        <div
          className="flex w-full flex-col items-center gap-4"
          aria-labelledby="pricing-heading"
        >
          <Pricing />
          <p className="text-muted-foreground text-xs">
            Billed yearly. Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
};

export default PricingSection;
