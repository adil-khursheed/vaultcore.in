import type { Metadata } from "next";
import React from "react";
import FeaturesSection from "@/components/home/features";
import HeroSection from "@/components/home/hero";
import PricingSection from "@/components/home/pricing";
import WhyUsSection from "@/components/home/why-us";
import StructuredData from "@/components/structured-data";
import { plans } from "@/lib/constants";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";

import SectionContainer from "@repo/site/components/section-container";

const description =
  "A zero-knowledge password manager for logins, cards, notes, and SSH keys. Encrypted on your device, shared safely with the people you trust.";

export const metadata: Metadata = {
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VaultCore — The quiet vault for your passwords",
    description,
    url: "/",
    type: "website",
    siteName: site.name,
    locale: site.locale,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultCore — The quiet vault for your passwords",
    description,
    site: site.twitterHandle,
    images: [twitterImage],
  },
};

const pricingUrl = absoluteUrl("/pricing/personal");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: absoluteUrl("/favicon.ico"),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${site.url}/#app`,
      name: site.name,
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      url: site.url,
      image: absoluteUrl(ogImage.url),
      description:
        "A zero-knowledge password manager and digital vault. Vault contents are encrypted on the user's device with AES-256-GCM.",
      isAccessibleForFree: true,
      offers: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: (plan.yearlyPriceUsd / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: pricingUrl,
      })),
    },
  ],
};

const LandingPage = () => {
  return (
    <>
      <StructuredData data={structuredData} />

      <SectionContainer>
        <HeroSection />

        <FeaturesSection />

        <WhyUsSection />

        <PricingSection />
      </SectionContainer>
    </>
  );
};

export default LandingPage;
