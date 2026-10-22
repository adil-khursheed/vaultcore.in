import type { Metadata } from "next";
import React from "react";
import SectionContainer from "@/components/shared/section-container";

import FeaturesSection from "./_components/features";
import HeroSection from "./_components/hero";
import PricingSection from "./_components/pricing";
import WhyUsSection from "./_components/why-us";

export const metadata: Metadata = {
  description:
    "A zero-knowledge password manager for logins, cards, identities, notes, and SSH keys. Encrypted on your device, shared safely with the people you trust.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VaultCore — The quiet vault for your passwords",
    description:
      "A zero-knowledge password manager for logins, cards, identities, notes, and SSH keys. Encrypted on your device, shared safely with the people you trust.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VaultCore — The quiet vault for your passwords",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/og-image.png",
        alt: "VaultCore — The quiet vault for your passwords",
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://vaultcore.in/#website",
      name: "VaultCore",
      url: "https://vaultcore.in",
      description:
        "A zero-knowledge password manager for logins, cards, identities, notes, and SSH keys.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "VaultCore",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      url: "https://vaultcore.in",
      description:
        "A zero-knowledge password manager and digital vault. Vault contents are encrypted on the user's device with AES-256-GCM.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        {
          "@type": "Offer",
          name: "Premium",
          price: "10.00",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Family",
          price: "49.99",
          priceCurrency: "USD",
        },
      ],
    },
  ],
};

const LandingPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
