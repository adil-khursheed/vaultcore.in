import type { Metadata } from "next";
import React from "react";
import { IconMail } from "@tabler/icons-react";
import { LegalPage, LegalSection } from "@/components/legal";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";

const title = "Support";
const description =
  "Get help with VaultCore — accounts and login, billing, security questions, and privacy. Email support@vaultcore.in.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/support" },
  openGraph: {
    title: `VaultCore ${title}`,
    description,
    url: "/support",
    type: "website",
    siteName: site.name,
    locale: site.locale,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `VaultCore ${title}`,
    description,
    site: site.twitterHandle,
    images: [twitterImage],
  },
};

const topics = [
  {
    title: "Account and login",
    body: "Sign in at dash.vaultcore.in. If you can't access your account, remember that your master password is never sent to us, so we can't reset it or recover your vault — keep it safe. You can always create a new vault and start fresh.",
  },
  {
    title: "Billing and plans",
    body: "Plans are billed yearly in USD through Polar. You can cancel any time from your account; your plan stays active until the end of the period you paid for. Receipts come from Polar at checkout.",
  },
  {
    title: "Sharing and members",
    body: "Every plan includes shared organizations. If an invitation isn't arriving, ask the sender to resend it, and check that the email isn't in spam — invitations come from noreply@vaultcore.in.",
  },
  {
    title: "Security and privacy questions",
    body: "Vault contents are encrypted on your device with AES-256-GCM and we never see the plaintext. For details on what we collect and the rights you have under the GDPR and India's DPDPA, read the Privacy Policy.",
  },
];

const LegalSupportPage = () => {
  return (
    <LegalPage
      title="Support"
      description="Real humans, honest answers. Write to us about anything — accounts, billing, security, or privacy."
      updated="November 17, 2026"
    >
      <LegalSection title="Email us">
        <a
          href="mailto:support@vaultcore.in"
          className="border-border bg-card hover:border-mint/40 focus-visible:ring-ring/50 flex items-center gap-4 rounded-2xl border p-5 shadow-sm outline-none transition-colors duration-200 focus-visible:ring-[3px]"
        >
          <span className="bg-mint/15 text-mint-ink dark:bg-mint/10 dark:text-mint flex size-10 shrink-0 items-center justify-center rounded-lg">
            <IconMail className="size-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-foreground font-semibold">
              support@vaultcore.in
            </span>
            <span className="text-muted-foreground text-sm">
              Premium and Family plans get priority email support. Everyone
              gets an answer.
            </span>
          </span>
        </a>
      </LegalSection>

      <LegalSection title="Common topics">
        <ul>
          {topics.map((topic) => (
            <li key={topic.title}>
              <strong>{topic.title}.</strong> {topic.body}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Quick answers">
        <p>
          Most questions about encryption, the free plan, and sharing are
          answered in the <a href="/#faq">FAQ on our homepage</a>, and plan
          details live on the <a href="/pricing/personal">pricing page</a>.
          For the legal side, see the <a href="/privacy">Privacy Policy</a>{" "}
          and <a href="/terms">Terms &amp; Conditions</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default LegalSupportPage;
