import type { Metadata } from "next";
import React from "react";
import { LegalPage, LegalSection } from "@/components/legal";
import { absoluteUrl, ogImage, site, twitterImage } from "@/lib/seo";

const title = "Privacy Policy";
const description =
  "How VaultCore collects, uses, and protects personal data — written for the GDPR and India's DPDPA. Your vault contents are end-to-end encrypted: we never see your plaintext.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `VaultCore ${title}`,
    description,
    url: "/privacy",
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

const LegalPrivacyPage = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what personal data VaultCore collects, why, and the rights you have under the EU General Data Protection Regulation (GDPR) and India's Digital Personal Data Protection Act (DPDPA)."
      updated="November 17, 2026"
    >
      <LegalSection title="The short version">
        <ul>
          <li>
            Your vault contents are encrypted on your device before they leave
            it. We store only ciphertext and can never read your passwords,
            cards, notes, or keys.
          </li>
          <li>
            Your master password is never transmitted to us — not at login, not
            at sync, never.
          </li>
          <li>
            We collect the minimum account data needed to run the service:
            your email address and a small set of technical records.
          </li>
          <li>We never sell personal data.</li>
          <li>
            Your account data is hosted in the EU (AWS, Frankfurt), and your
            encrypted vault data is served from the same region.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Data inside your vault">
        <p>
          Everything you store in VaultCore — logins, cards, identities,
          notes, and SSH keys — is encrypted on your device with AES-256-GCM
          before it is sent to our servers. Our servers receive and store only
          ciphertext. Because we do not hold the keys, we cannot decrypt,
          read, scan, or process the contents of your vault.
        </p>
        <p>
          For personal data that you choose to store or share through your
          vault (for example, a family member's card details), <strong>you
          act as the controller</strong> under the GDPR and as the Data
          Fiduciary under the DPDPA. VaultCore processes that data solely as a
          conduit: we transmit and store it in encrypted form on your
          instructions and have no practical ability to access it. You are
          responsible for having a lawful basis to store or share other
          people's information in your vault.
        </p>
      </LegalSection>

      <LegalSection title="Account data we collect">
        <p>To create and operate your account, we process:</p>
        <ul>
          <li>
            <strong>Email address</strong> — collected at signup and used to
            identify your account, verify it, deliver invitations, welcome
            messages, and product emails such as your weekly vault digest.
          </li>
          <li>
            <strong>Display name</strong> — derived automatically from the
            prefix of your email address. We do not ask for your real name.
          </li>
          <li>
            <strong>Cryptographic key material</strong> — your public key and
            your private key in encrypted form, generated on your device. The
            encrypted private key is wrapped so that only your master password
            can unlock it.
          </li>
          <li>
            <strong>Password verifier</strong> — a derived value that proves
            your password without storing or transmitting the password itself.
          </li>
          <li>
            <strong>Session records</strong> — IP address and browser user
            agent, kept with active sessions for security auditing (you can
            see your active sessions and what was accessed in your
            organization's audit log).
          </li>
          <li>
            <strong>Billing records</strong> — if you subscribe to a paid
            plan, your email and the subscription status, plan, and payment
            amounts we receive from our payment processor. Card numbers and
            full payment details are handled by the payment processor and
            never reach our servers.
          </li>
          <li>
            <strong>Support correspondence</strong> — anything you send us
            when you ask for help.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Why we process it, and our legal bases (GDPR)">
        <ul>
          <li>
            <strong>To provide the service you signed up for</strong> (Art.
            6(1)(b) GDPR): account creation, authentication, cross-device
            sync, sharing with organizations you choose, and billing.
          </li>
          <li>
            <strong>To keep the service secure</strong> (Art. 6(1)(f) GDPR,
            legitimate interests): session records, abuse prevention, and
            audit logging.
          </li>
          <li>
            <strong>To send you service emails</strong> (Art. 6(1)(b)/(c)):
            email verification, invitations, security notices, and billing
            communication. We do not send third-party marketing emails.
          </li>
          <li>
            <strong>Analytics, if enabled</strong> (Art. 6(1)(a) GDPR, or
            legitimate interests where permitted): the marketing site and the
            product can carry Google Analytics/Tag Manager when that
            integration is configured. We keep this optional and off by
            default.
          </li>
        </ul>
        <p>
          Under the DPDPA, processing is carried out on the basis of your
          consent, given when you create your account and use the service,
          together with the notice you are reading now. You can withdraw
          consent for optional processing (such as analytics) at any time;
          withdrawal does not affect processing already carried out. Where
          consent applies, you may also nominate another individual to
          exercise your rights on your behalf in case of incapacity.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and tracking">
        <ul>
          <li>
            <strong>Session cookie</strong> (<code className="font-mono text-xs">__Secure-better-auth.session_token</code>)
            — strictly necessary, set by the product at{" "}
            <strong>dash.vaultcore.in</strong> to keep you signed in. Not used
            for tracking.
          </li>
          <li>
            <strong>Interface hint cookie</strong> (<code className="font-mono text-xs">vc_auth_hint</code>)
            — a non-identifying value set on vaultcore.in that shows
            "Go to dashboard" instead of "Log in". It contains no personal
            data.
          </li>
          <li>
            <strong>Analytics cookies</strong> — Google Analytics/Tag Manager
            may run on the marketing site and in the product when that
            optional integration is enabled. When enabled, Google may set its
            own cookies; see Google's privacy policy for details.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Who else processes your data">
        <p>
          We use a small, fixed set of providers. None of them receive your
          vault keys, and none can read your vault:
        </p>
        <ul>
          <li>
            <strong>AWS (eu-central-1, Frankfurt)</strong> — application
            hosting and the encrypted PostgreSQL database that stores account
            records, ciphertext, and audit data.
          </li>
          <li>
            <strong>Vercel</strong> — hosting of this marketing website.
          </li>
          <li>
            <strong>Cloudflare</strong> — DNS and TLS termination for{" "}
            <strong>dash.vaultcore.in</strong>.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional and product
            emails (verification, invitations, welcome, weekly digest) from{" "}
            <strong>noreply@vaultcore.in</strong>.
          </li>
          <li>
            <strong>Polar</strong> — checkout, subscription management, and
            payment processing for paid plans. Polar collects your email and
            billing details at checkout as an independent controller of its
            payment data.
          </li>
        </ul>
        <p>
          We do not sell personal data, and we do not share it with
          advertisers. We may disclose data where the law requires it (for
          example, a valid legal order), and we will challenge overbroad
          requests where possible.
        </p>
      </LegalSection>

      <LegalSection title="Where your data lives">
        <p>
          Account data and vault ciphertext are stored in AWS's Frankfurt
          region (eu-central-1). The database is encrypted at rest, with
          automated backups retained for 7 days. If you are in the EU/EEA,
          your data remains in the EU. For users elsewhere, data may be
          accessed by our infrastructure providers in the course of providing
          their services; where required, transfers are protected by the
          providers' standard contractual clauses.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <ul>
          <li>
            <strong>Account and vault data</strong> — for as long as your
            account exists. When you delete your account, your account
            records and vault ciphertext are deleted; backup copies are
            overwritten within 7 days.
          </li>
          <li>
            <strong>Session records</strong> — kept with your account for
            security auditing.
          </li>
          <li>
            <strong>Billing records</strong> — kept as long as tax and
            accounting law requires.
          </li>
          <li>
            <strong>Support correspondence</strong> — kept until your request
            is resolved, then only as long as needed for legal protection.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live, you have some or all of the following:
        </p>
        <ul>
          <li>
            <strong>Access</strong> — get a copy of the personal data we hold
            about you.
          </li>
          <li>
            <strong>Correction</strong> — fix inaccurate data (including your
            email address and display name).
          </li>
          <li>
            <strong>Erasure</strong> — delete your account and its data.
            Deleting your account in the product is immediate and removes
            your vault ciphertext with it.
          </li>
          <li>
            <strong>Portability</strong> — receive your data in a structured,
            commonly used format.
          </li>
          <li>
            <strong>Objection and restriction</strong> — object to or limit
            certain processing.
          </li>
          <li>
            <strong>Grievance redressal (DPDPA)</strong> — raise a complaint
            with our Grievance Officer (below) and expect a response within
            30 days.
          </li>
        </ul>
        <p>
          Note one boundary that no regulation can override: because your
          vault is end-to-end encrypted, we cannot produce the plaintext
          contents of your vault — not to you, not to a regulator, not to a
          court. What we can produce is the account data described above and
          your ciphertext, which remains unreadable without your keys.
        </p>
        <p>
          To exercise any right, write to <strong>support@vaultcore.in</strong>.
          If you are in the EU/EEA, you may also complain to your local data
          protection authority; if you are in India, to the Data Protection
          Board of India.
        </p>
      </LegalSection>

      <LegalSection title="How we protect data">
        <ul>
          <li>
            End-to-end encryption of vault contents (AES-256-GCM) performed on
            your device; member keys are wrapped with RSA-OAEP so shared
            access stays crypto-enforced.
          </li>
          <li>Your master password is never transmitted or stored.</li>
          <li>TLS in transit everywhere; database encrypted at rest.</li>
          <li>
            Audit trails for organizations, so changes and access are
            recorded and visible to you.
          </li>
          <li>
            Data minimization by design: we ask for an email, not your name,
            address, or phone number.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          VaultCore is not directed at children, and we do not knowingly
          process data from children below the age at which valid consent can
          be given in your jurisdiction (in India, below 18 for processing
          that requires verifiable parental consent under the DPDPA; in the
          EU, the digital-consent age set by your member state). If you
          believe a child has created an account, contact us and we will
          delete it.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we change this policy materially, we will notify you by email or
          by a notice in the product before the change takes effect. The
          version above always shows its last-updated date.
        </p>
      </LegalSection>

      <LegalSection title="Contact and Grievance Officer">
        <p>
          VaultCore is the controller of your account data (under the GDPR)
          and the Data Fiduciary (under India's DPDPA).
        </p>
        <p>
          Questions, rights requests, and grievances:{" "}
          <strong>support@vaultcore.in</strong> — Grievance Officer,
          VaultCore. We respond to grievances within 30 days.
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default LegalPrivacyPage;
