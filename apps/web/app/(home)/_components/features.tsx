"use client";

import React from "react";
import SectionContainer from "@/components/shared/section-container";
import {
  IconDevices,
  IconKey,
  IconLockSquareRounded,
  IconRefresh,
  IconShieldLock,
  IconSpyOff,
} from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "@repo/ui/lib/utils";

// --- Skeletons ---

const EncryptionSkeleton = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Client */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary/20 border-primary/20 flex size-10 items-center justify-center rounded-lg border">
            <IconLockSquareRounded className="text-primary size-6" />
          </div>
          <div className="bg-border h-2 w-12 rounded-full" />
        </div>

        {/* Connection Line */}
        <div className="bg-border relative h-px flex-1">
          <motion.div
            className="bg-primary absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
            animate={{ left: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Server */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted border-border flex size-10 items-center justify-center rounded-lg border">
            <IconShieldLock className="text-muted-foreground size-6" />
          </div>
          <div className="bg-border h-2 w-12 rounded-full" />
        </div>
      </div>

      <div className="border-border w-full space-y-2 rounded-xl border border-dashed p-3">
        <div className="flex items-center gap-2">
          <div className="size-2 animate-pulse rounded-full bg-green-500" />
          <div className="bg-muted-foreground/20 h-2 w-20 rounded-full" />
        </div>
        <div className="bg-muted-foreground/10 h-2 w-full rounded-full" />
        <div className="bg-muted-foreground/10 h-2 w-3/4 rounded-full" />
      </div>
    </div>
  );
};

const AutoFillSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 p-6">
      <div className="flex flex-col gap-1">
        <div className="bg-muted-foreground/40 h-2 w-16 rounded-full" />
        <motion.div
          className="border-border bg-background flex h-8 w-full items-center rounded-md border px-2"
          initial={{ borderColor: "var(--border)" }}
          animate={{
            borderColor: ["var(--border)", "#3b82f6", "var(--border)"],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <motion.div
            className="bg-primary h-4 w-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="bg-muted-foreground/40 h-2 w-16 rounded-full" />
        <div className="border-border bg-background flex h-8 w-full items-center gap-1 rounded-md border px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1, duration: 0.2 }}
              className="bg-foreground size-2 rounded-full"
            />
          ))}
        </div>
      </div>
      <motion.div
        className="bg-primary/20 mt-1 h-8 w-24 rounded-md"
        animate={{
          scale: [1, 1.05, 1],
          backgroundColor: [
            "rgba(var(--primary), 0.2)",
            "rgba(var(--primary), 0.4)",
            "rgba(var(--primary), 0.2)",
          ],
        }}
        transition={{ delay: 2, duration: 0.5 }}
      />
    </div>
  );
};

const VaultSkeleton = () => {
  return (
    <div className="relative h-full w-full overflow-hidden p-4">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="border-border bg-background/50 flex items-center gap-3 rounded-lg border p-2"
            initial={{ opacity: 0.5, x: 0 }}
            whileHover={{ scale: 1.02, backgroundColor: "var(--background)" }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, delay: i * 0.5 },
            }}
          >
            <div
              className={`size-8 rounded-md ${i === 1 ? "bg-blue-500/20" : i === 2 ? "bg-orange-500/20" : "bg-green-500/20"}`}
            />
            <div className="flex-1 space-y-1.5">
              <div className="bg-foreground/20 h-2 w-24 rounded-full" />
              <div className="bg-muted-foreground/20 h-1.5 w-16 rounded-full" />
            </div>
            <div className="bg-muted-foreground/20 size-2 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GeneratorSkeleton = () => {
  const [text, setText] = React.useState("a8F#k9!m");
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  React.useEffect(() => {
    const interval = setInterval(() => {
      setText(
        Array(12)
          .fill(0)
          .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
          .join(""),
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <div className="border-border bg-background w-full rounded-xl border p-4 text-center shadow-inner">
        <span className="text-primary font-mono text-lg font-bold tracking-widest">
          {text}
        </span>
      </div>
      <div className="mt-4 flex w-full gap-2">
        <div className="h-2 flex-1 rounded-full bg-green-500" />
        <div className="h-2 flex-1 rounded-full bg-green-500" />
        <div className="h-2 flex-1 rounded-full bg-green-500" />
        <div className="h-2 flex-1 rounded-full bg-green-500/30" />
      </div>
    </div>
  );
};

const SyncSkeleton = () => {
  return (
    <div className="flex h-full w-full items-center justify-center gap-8 p-4">
      <div className="relative flex flex-col items-center">
        <IconDevices className="text-muted-foreground size-12" />
        <motion.div
          className="border-background absolute -top-2 -right-2 size-3 rounded-full border-2 bg-green-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
      <motion.div
        className="via-primary h-1 flex-1 bg-linear-to-r from-transparent to-transparent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="relative flex flex-col items-center">
        <div className="border-muted-foreground/40 size-12 rounded-lg border-2 border-dashed" />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <IconShieldLock className="text-primary size-6" />
        </motion.div>
      </div>
    </div>
  );
};

const ZeroKnowledgeSkeleton = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div className="border-border bg-muted/20 relative flex size-24 items-center justify-center overflow-hidden rounded-full border">
        <IconSpyOff className="text-muted-foreground/50 size-10" />

        <motion.div
          className="via-primary/10 absolute inset-0 bg-linear-to-b from-transparent to-transparent"
          animate={{ top: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="item-center absolute top-4 right-4 flex gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs text-green-500">
        <span>Encrypted</span>
      </div>
    </div>
  );
};

const features = [
  {
    title: "End-to-End Encryption",
    description:
      "Your data is encrypted on your device before it ever reaches our servers.",
    icon: IconShieldLock,
    className: "",
    skeleton: <EncryptionSkeleton />,
  },
  {
    title: "Auto-Fill Magic",
    description:
      "Log in to your favorite sites with a single click. No more typing.",
    icon: IconKey,
    className: "",
    skeleton: <AutoFillSkeleton />,
  },
  {
    title: "Secure Vault",
    description: "Store passwords, notes, cards, and identities safely.",
    icon: IconLockSquareRounded,
    className: "",
    skeleton: <VaultSkeleton />,
  },
  {
    title: "Password Generator",
    description: "Create unbreakable passwords with customizable complexity.",
    icon: IconRefresh,
    className: "",
    skeleton: <GeneratorSkeleton />,
  },
  {
    title: "Cross-Device Sync",
    description: "Access your vault from any device. Real-time sync.",
    icon: IconDevices,
    className: "",
    skeleton: <SyncSkeleton />,
  },
  {
    title: "Zero-Knowledge",
    description: "We know nothing about your data. Complete privacy.",
    icon: IconSpyOff,
    className: "",
    skeleton: <ZeroKnowledgeSkeleton />,
  },
];

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={cn(
        "group border-border bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border shadow-sm transition-all hover:shadow-xl",
        feature.className,
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100",
        )}
      />

      {/* Skeleton / Visual Area */}
      <div className="border-border/50 bg-muted/20 relative h-52 w-full overflow-hidden border-b">
        <div className="absolute inset-0 flex items-center justify-center">
          {feature.skeleton}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
            <feature.icon className="size-5" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">
            {feature.title}
          </h3>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <SectionContainer className="min-h-auto py-24">
      <div className="border_bottom flex flex-col items-center gap-12 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-foreground text-3xl font-bold md:text-5xl">
            Everything you need for <br />
            <span className="text-primary">Unbreakable Security</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Powerful features designed to keep your digital life secure,
            organized, and accessible only to you.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default FeaturesSection;
