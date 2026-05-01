import React from "react";
import SectionContainer from "@/components/shared/section-container";

import FeaturesSection from "./_components/features";
import HeroSection from "./_components/hero";
import PricingSection from "./_components/pricing";
import WhyUsSection from "./_components/why-us";

const LandingPage = () => {
  return (
    <SectionContainer>
      <HeroSection />

      <FeaturesSection />

      <WhyUsSection />

      <PricingSection />
    </SectionContainer>
  );
};

export default LandingPage;
