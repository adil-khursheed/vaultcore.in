import React from "react";
import { IconChevronDown } from "@tabler/icons-react";

import SectionContainer from "@repo/site/components/section-container";

// Answers are written to stand alone: the first sentence answers the
// question directly so answer engines can quote it verbatim.
export const faqs = [
  {
    question: "What is VaultCore?",
    answer:
      "VaultCore is a zero-knowledge password manager that stores logins, payment cards, identities, secure notes, and SSH keys in one encrypted vault. Everything is encrypted on your device with AES-256-GCM before it reaches our servers, so VaultCore never sees your plaintext.",
  },
  {
    question: "Is VaultCore free?",
    answer:
      "Yes. The Free plan is free to keep and includes one organization with two members, end-to-end encryption, and unlimited devices and sync. Premium costs $10 per year and Family costs $49.99 per year — see the pricing page for the full comparison.",
  },
  {
    question: "How is VaultCore different from 1Password or Bitwarden?",
    answer:
      "VaultCore is built so plaintext never exists on our servers: your vault is encrypted on your device with AES-256-GCM, member keys are wrapped with RSA-OAEP, and your master password is never sent anywhere. You still get one-click autofill, a password generator, cross-device sync, and a free plan that stays free.",
  },
  {
    question: "What does zero-knowledge mean?",
    answer:
      "Zero-knowledge means the server only ever stores ciphertext. Your vault is encrypted on your device with AES-256-GCM before anything leaves, and your master password is never transmitted — not even to VaultCore. No one at VaultCore can read your vault.",
  },
  {
    question: "Can VaultCore autofill my passwords in the browser?",
    answer:
      "Yes. The VaultCore browser extension fills logins in one click — no copying, no typing, and no switching between windows.",
  },
  {
    question: "What can I store in VaultCore?",
    answer:
      "Logins, payment cards, identities, secure notes, and SSH keys — all in a single encrypted list that stays organized across your devices.",
  },
  {
    question: "Can I share passwords with my family?",
    answer:
      "Yes. Every plan includes shared organizations: Free covers two members, and the Family plan ($49.99 per year) covers up to ten members with a shared household vault and a family security dashboard.",
  },
  {
    question: "Does VaultCore work on all my devices?",
    answer:
      "Yes — unlimited devices and sync are included on every plan. Your vault follows you across devices, encrypted the whole way through.",
  },
] as const;

const FaqSection = () => {
  return (
    <SectionContainer
      id="faq"
      labelledBy="faq-heading"
      className="bg-muted min-h-auto scroll-mt-20 py-24"
    >
      <div className="border_bottom flex flex-col items-center gap-12 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            id="faq-heading"
            className="text-foreground text-3xl font-bold text-balance md:text-5xl"
          >
            Questions, answered plainly.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base text-pretty md:text-lg">
            The things people check before trusting a manager with every
            password they own.
          </p>
        </div>

        <div
          className="divide-border border-border w-full max-w-3xl divide-y border-y"
          aria-labelledby="faq-heading"
        >
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <IconChevronDown
                  className="text-muted-foreground size-4 shrink-0 transition-transform duration-300 ease-out group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="text-muted-foreground pb-4 text-sm leading-relaxed text-pretty">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default FaqSection;
