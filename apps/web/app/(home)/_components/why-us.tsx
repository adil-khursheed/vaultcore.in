"use client";

import React from "react";
import SectionContainer from "@/components/shared/section-container";
import {
  IconCheck,
  IconEyeOff,
  IconNotes,
  IconRepeat,
  IconShieldLock,
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

const protectionFacts = [
  { label: "Plaintext on server", value: "None" },
  { label: "Encryption", value: "AES-256-GCM" },
  { label: "Member key wrapping", value: "RSA-OAEP" },
  { label: "Master password", value: "Never sent" },
];

const WhyUsSection = () => {
  return (
    <SectionContainer
      id="security"
      className="bg-muted/30 min-h-auto scroll-mt-20 py-24"
    >
      <MotionConfig reducedMotion="user">
        <div className="border_bottom grid gap-16 px-4 md:grid-cols-2 md:items-center lg:gap-24">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <h2 className="text-foreground text-3xl font-bold text-balance md:text-5xl">
                Most breaches start with a password you already use.
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty md:text-lg">
                Reused logins, sticky notes, and spreadsheets make the easy path
                the risky one. VaultCore makes the safe path just as quick.
              </p>
            </motion.div>

            <div className="divide-border border-border divide-y border-y">
              {painPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 + 0.15 }}
                  className="group flex items-start gap-4 py-5"
                >
                  <div className="border-destructive/20 bg-destructive/5 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 ease-out group-hover:scale-105">
                    <point.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="relative"
          >
            <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
              <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <IconShieldLock className="text-mint size-4" />
                  <h3 className="text-foreground text-sm font-semibold">
                    What leaves your device
                  </h3>
                </div>
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                  <span className="bg-mint size-1.5 rounded-full" />
                  Ciphertext only
                </span>
              </div>

              <dl className="divide-border divide-y px-5">
                {protectionFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <dt className="text-muted-foreground text-sm">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground flex items-center gap-1.5 font-mono text-xs">
                      {fact.value === "None" || fact.value === "Never sent" ? (
                        <IconCheck className="text-mint size-3.5" />
                      ) : null}
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-border bg-muted/40 border-t px-5 py-4">
                <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
                  <IconShieldLock className="text-mint mt-0.5 size-3.5 shrink-0" />
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
