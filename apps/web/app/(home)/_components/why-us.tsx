"use client";

import React from "react";
import SectionContainer from "@/components/shared/section-container";
import {
  IconCheck,
  IconEyeOff,
  IconNotes,
  IconRepeat,
} from "@tabler/icons-react";
import { motion, MotionConfig } from "motion/react";

const painPoints = [
  {
    title: "Reused passwords",
    description:
      "One breach exposes every account that shares the same secret.",
    icon: IconRepeat,
  },
  {
    title: "Written down and scattered",
    description:
      "Notes and spreadsheets are easy to find and impossible to audit.",
    icon: IconNotes,
  },
  {
    title: "No idea what's exposed",
    description:
      "Without a record of access and changes, you can't tell what went wrong.",
    icon: IconEyeOff,
  },
];

type ProtectionFact = {
  label: string;
  value: string;
  verified?: boolean;
  exact?: boolean;
};

const protectionFacts: ProtectionFact[] = [
  { label: "Plaintext on server", value: "None", verified: true },
  { label: "Encryption", value: "AES-256-GCM", exact: true },
  { label: "Member key wrapping", value: "RSA-OAEP", exact: true },
  { label: "Master password", value: "Never sent", verified: true },
];

const WhyUsSection = () => {
  return (
    <SectionContainer
      id="security"
      labelledBy="why-us-heading"
      className="bg-muted min-h-auto scroll-mt-20 py-24"
    >
      <MotionConfig reducedMotion="user">
        <div className="border_bottom grid gap-16 px-4 md:grid-cols-2 md:items-start lg:gap-24">
          <div className="flex flex-col gap-12">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
            >
              <h2
                id="why-us-heading"
                className="text-foreground text-3xl font-bold text-balance md:text-4xl lg:text-5xl"
              >
                Most breaches start with a password you already use.
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty md:text-lg">
                Reused logins, sticky notes, and spreadsheets make the easy path
                the risky one. VaultCore makes the safe path just as quick.
              </p>
            </motion.div>

            <ul className="divide-border border-border divide-y border-y">
              {painPoints.map((point, index) => (
                <motion.li
                  key={point.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 + 0.1 }}
                  className="group flex items-start gap-4 py-5"
                >
                  <div className="border-destructive/20 bg-destructive/5 text-destructive dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 ease-out motion-safe:group-hover:scale-105">
                    <point.icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative"
          >
            <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
              <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-4">
                <h3 className="text-foreground text-sm font-semibold">
                  What leaves your device
                </h3>
                <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap">
                  <span
                    className="bg-mint-ink dark:bg-mint size-1.5 rounded-full"
                    aria-hidden
                  />
                  Ciphertext only
                </span>
              </div>

              <dl className="divide-border divide-y px-6">
                {protectionFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <dt className="text-muted-foreground text-sm">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground flex items-center gap-1.5 text-xs">
                      {fact.verified ? (
                        <IconCheck
                          className="text-mint-ink dark:text-mint size-3.5"
                          aria-hidden
                        />
                      ) : null}
                      <span className={fact.exact ? "font-mono" : undefined}>
                        {fact.value}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-border bg-muted/40 border-t px-6 py-4">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Your master password stays on your device. Always.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    </SectionContainer>
  );
};

export default WhyUsSection;
