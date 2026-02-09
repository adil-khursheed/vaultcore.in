"use client";

import React from "react";
import SectionContainer from "@/components/shared/section-container";
import {
  IconAlertTriangle,
  IconCheck,
  IconMoodConfuzed,
  IconShield,
  IconUserExclamation,
} from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "@repo/ui/lib/utils";

const painPoints = [
  {
    title: "Weak Passwords",
    description: "Using 'password123' or birthdays makes you an easy target.",
    icon: IconMoodConfuzed,
  },
  {
    title: "Reused Credits",
    description:
      "One breach exposes all your accounts if you recycle passwords.",
    icon: IconUserExclamation,
  },
  {
    title: "Manual Storage",
    description:
      "Sticky notes and spreadsheets are insecure and hard to manage.",
    icon: IconAlertTriangle,
  },
];

const WhyUsSection = () => {
  return (
    <SectionContainer className="bg-muted/30 min-h-auto py-24">
      <div className="border_bottom grid gap-16 px-4 md:grid-cols-2 md:items-center lg:gap-24">
        {/* Left Column: Content */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-foreground text-3xl font-bold md:text-5xl">
              Stop Compromising <br />
              <span className="text-muted-foreground">Your Security</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              81% of hacking-related breaches leverage either stolen or weak
              passwords. Managing your digital keys manually is no longer an
              option.
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {painPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="bg-background flex items-start gap-4 rounded-xl border p-4 shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <point.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual/Solution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="from-primary/20 to-primary/5 absolute inset-0 rounded-3xl bg-linear-to-br via-transparent blur-3xl" />
          <div className="bg-card border-border relative overflow-hidden rounded-3xl border shadow-2xl">
            <div className="bg-muted/50 flex items-center gap-2 border-b px-6 py-4">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
            </div>

            <div className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
                    <IconShield className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      VaultCore Protection
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Bank-grade security standards
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background/50 flex items-center justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground text-sm">
                      Analysis
                    </span>
                    <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                      Safe
                    </span>
                  </div>
                  <div className="bg-background/50 flex items-center justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground text-sm">
                      Encryption
                    </span>
                    <span className="text-primary text-xs font-medium">
                      AES-256-GCM
                    </span>
                  </div>
                  <div className="bg-background/50 flex items-center justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground text-sm">
                      Backup Status
                    </span>
                    <div className="text-primary flex items-center gap-1 text-xs">
                      <IconCheck className="size-3" />
                      Synced
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-primary text-sm font-medium">
                    "The only secure password is the one you don't know."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
};

export default WhyUsSection;
