import type { Metadata } from "next";
import React from "react";
import FaqSection, { faqs } from "@/components/home/faq";
import FeaturesSection from "@/components/home/features";
import HeroSection from "@/components/home/hero";
import PricingSection from "@/components/home/pricing";
import WhyUsSection from "@/components/home/why-us";
import StructuredData from "@/components/structured-data";
import { plans } from "@/lib/constants";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";

import SectionContainer from "@repo/site/components/section-container";

const description =
  "A free-to-start zero-knowledge password manager for logins, cards, notes, and SSH keys. Encrypted on your device with AES-256-GCM, with one-click autofill, a password generator, and cross-device sync.";

export const metadata: Metadata = {
  description,
  keywords: [
    "free password manager",
    "zero-knowledge password manager",
    "best password manager",
    "password manager app",
    "password manager with autofill",
    "password generator",
  ],
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
    {
      "@type": "FAQPage",
      "@id": `${site.url}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
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

        <FaqSection />
      </SectionContainer>
    </>
  );
};

export default LandingPage;
