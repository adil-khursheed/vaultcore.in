import type { Metadata } from "next";
import React from "react";
import { LegalPage, LegalSection } from "@/components/legal";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";

const title = "Terms & Conditions";
const description =
  "The terms that govern your use of VaultCore — accounts, subscriptions, acceptable use, and the responsibilities that come with a zero-knowledge service.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `VaultCore ${title}`,
    description,
    url: "/terms",
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

const LegalTermsPage = () => {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="These terms are an agreement between you and VaultCore for the use of the VaultCore password manager at dash.vaultcore.in and this website at vaultcore.in."
      updated="November 17, 2026"
    >
      <LegalSection title="Using VaultCore">
        <p>
          By creating an account or using the service, you agree to these
          terms. If you use VaultCore on behalf of an organization, you
          confirm you are authorized to bind that organization to them.
        </p>
        <p>
          You must be old enough to form a binding contract where you live
          and at least 18 to consent to processing of personal data where
          local law requires verifiable parental consent (for example, in
          India under the DPDPA).
        </p>
      </LegalSection>

      <LegalSection title="Your account and your master password">
        <ul>
          <li>
            Your account is identified by your email address; we do not ask
            for your real name.
          </li>
          <li>
            <strong>
              Your master password is never sent to VaultCore.
            </strong>{" "}
            It unlocks your encrypted private key on your devices. We cannot
            reset it, recover it, or recover your vault if you lose it —
            losing your master password means losing access to your vault
            contents permanently. There is no plaintext copy and no
            backdoor.
          </li>
          <li>
            You are responsible for keeping your master password and devices
            safe, and for all activity that happens under your account.
          </li>
          <li>
            Deleting your account is immediate and irreversible: your account
            data and encrypted vault contents are deleted.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Subscriptions and billing">
        <p>
          Paid plans are billed yearly in USD through our payment processor,
          Polar. Current plan details are on our pricing page:
        </p>
        <ul>
          <li>
            <strong>Free</strong> — $0/year: 1 organization, 2 members, end-to-end
            encryption, unlimited devices and sync.
          </li>
          <li>
            <strong>Premium</strong> — $10/year: 2 organizations, 3 members,
            priority email support, advanced vault items.
          </li>
          <li>
            <strong>Family</strong> — $49.99/year: unlimited organizations,
            10 members, household sharing, family security dashboard.
          </li>
        </ul>
        <p>
          You can cancel at any time from your account; your plan stays
          active until the end of the billing period you paid for, and we do
          not bill again after cancellation. If we change prices, we will
          tell you before renewal, and the change applies only from your next
          billing period.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>
            use the service to store or share content you do not have the
            right to store or share, or content that is unlawful;
          </li>
          <li>
            probe, scan, or attack the service, other users' accounts, or our
            infrastructure, or attempt to break the encryption of vaults that
            are not yours;
          </li>
          <li>
            misuse invitations or create accounts to spam, harass, or abuse
            other members of an organization;
          </li>
          <li>
            resell, rent, or provide the service to third parties as a
            managed offering without our agreement;
          </li>
          <li>
            scrape the marketing site or use it in a way that degrades its
            operation.
          </li>
        </ul>
        <p>
          We may suspend or terminate accounts that break these rules or
          that create legal or security risk for the service or its users.
        </p>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          Everything in your vault is yours. You grant VaultCore only the
          limited technical permission needed to store and sync your
          encrypted data and to transmit it between your devices and the
          members of organizations you choose. We do not access, use, or
          analyze your vault contents — technically, we cannot.
        </p>
        <p>
          When you share vault access with other members, you confirm you
          have the right to share that information, and you are responsible
          for how you use sharing.
        </p>
      </LegalSection>

      <LegalSection title="Our intellectual property">
        <p>
          The VaultCore name, logo, site design, and software are owned by
          VaultCore and protected by intellectual-property law. You may not
          use our branding without permission, except to refer to the product
          in ordinary review or comparison.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We work to keep VaultCore available and may change or improve the
          service over time. If we discontinue a significant feature or the
          service itself, we will give you reasonable advance notice by email
          and, where practical, a way to export your data.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers and liability">
        <p>
          The service is provided "as is". To the extent permitted by law, we
          disclaim warranties that are not stated in these terms, including
          implied warranties of merchantability and fitness for a particular
          purpose.
        </p>
        <p>
          To the extent permitted by law, VaultCore's total liability for any
          claim relating to the service is limited to the amount you paid us
          in the 12 months before the claim, or $10 if you are on the free
          plan. We are not liable for indirect or consequential losses, or
          for losses caused by a master password you lose or disclose.
          Nothing in these terms limits liability that cannot be limited by
          law.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You can stop using VaultCore and delete your account at any time.
          We may suspend or terminate your account for breach of these terms
          or where required by law, with notice where reasonably possible.
          Sections that should survive termination (liability, IP, governing
          law) do.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of India, without regard to
          conflict-of-law rules. Consumers keep any mandatory protections of
          the law of their country of residence, including EU consumer law
          where it applies.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms. For material changes we will notify you
          by email or in the product in advance. Continuing to use VaultCore
          after a change takes effect means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms: <strong>support@vaultcore.in</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default LegalTermsPage;
