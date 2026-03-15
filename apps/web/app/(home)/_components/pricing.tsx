import React from "react";
import Pricing from "@/components/shared/pricing";
import SectionContainer from "@/components/shared/section-container";

const PricingSection = () => {
  return (
    <SectionContainer className="min-h-auto py-24">
      <div className="border_bottom flex flex-col items-center gap-16 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-foreground text-3xl font-bold md:text-5xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Choose the plan that fits your security needs. No hidden fees.
            Cancel anytime.
          </p>
        </div>

        <Pricing />
      </div>
    </SectionContainer>
  );
};

export default PricingSection;
