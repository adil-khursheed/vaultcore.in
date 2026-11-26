"use client";

import React from "react";
import {
  IconDeviceDesktop,
  IconKey,
  IconLockSquareRounded,
  IconRefresh,
  IconShieldLock,
  IconSpyOff,
} from "@tabler/icons-react";
import { motion, MotionConfig } from "motion/react";

import SectionContainer from "@repo/site/components/section-container";
import { cn } from "@repo/ui/lib/utils";

import {
  AutofillVisual,
  EncryptionVisual,
  GeneratorVisual,
  SyncVisual,
  useReveal,
  VaultVisual,
  ZeroKnowledgeVisual,
} from "./product-visuals";

type FeatureVisual = React.ComponentType<{ seen: boolean; hovered?: boolean }>;

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  visual: FeatureVisual;
};

const features: Feature[] = [
  {
    title: "End-to-end encryption",
    description:
      "Encrypted on your device with AES-256-GCM before anything leaves for our servers.",
    icon: IconShieldLock,
    className: "sm:col-span-2",
    visual: EncryptionVisual,
  },
  {
    title: "One-click autofill",
    description:
      "Fill logins in your browser with the VaultCore extension. No copying, no typing.",
    icon: IconKey,
    className: "",
    visual: AutofillVisual,
  },
  {
    title: "One organized vault",
    description:
      "Logins, cards, identities, notes, and SSH keys in a single encrypted list.",
    icon: IconLockSquareRounded,
    className: "",
    visual: VaultVisual,
  },
  {
    title: "Passwords worth keeping",
    description:
      "Generate long, unique passwords and let VaultCore remember them for you.",
    icon: IconRefresh,
    className: "",
    visual: GeneratorVisual,
  },
  {
    title: "In sync everywhere",
    description:
      "Your vault follows you across devices, encrypted the whole way through.",
    icon: IconDeviceDesktop,
    className: "",
    visual: SyncVisual,
  },
  {
    title: "Zero-knowledge by design",
    description:
      "Your keys stay on your device. The server only ever stores ciphertext.",
    icon: IconSpyOff,
    className: "sm:col-span-2",
    visual: ZeroKnowledgeVisual,
  },
];

const FeatureCard = ({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) => {
  const [ref, seen] = useReveal(index * 90);
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      ref={ref}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "group border-border bg-card focus-visible:ring-mint/60 relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out outline-none hover:shadow-xl focus-visible:ring-2 motion-safe:hover:-translate-y-1",
        feature.className,
      )}
    >
      <div
        aria-hidden
        className="border-border bg-muted/40 @container relative h-64 w-full overflow-hidden border-b lg:h-60"
      >
        <feature.visual seen={seen} hovered={hovered} />
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <div className="bg-mint/15 text-mint-ink group-hover:bg-mint dark:bg-mint/10 dark:text-mint group-hover:text-mint-ink flex size-9 items-center justify-center rounded-lg transition-colors duration-300">
            <feature.icon className="size-4.5" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
            {feature.title}
          </h3>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <SectionContainer id="features" className="min-h-auto scroll-mt-20 py-24">
      <div className="border_bottom flex flex-col items-center gap-12 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            id="features-heading"
            className="text-foreground text-3xl font-bold text-balance md:text-5xl"
          >
            Security you can stop thinking about.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base text-pretty md:text-lg">
            Encryption, autofill, and sharing, designed so the safe choice is
            also the fast one.
          </p>
        </div>

        <MotionConfig reducedMotion="user">
          <div
            className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-labelledby="features-heading"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </MotionConfig>
      </div>
    </SectionContainer>
  );
};

export default FeaturesSection;
