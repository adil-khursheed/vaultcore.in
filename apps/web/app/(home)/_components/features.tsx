"use client";

import React from "react";
import SectionContainer from "@/components/shared/section-container";
import {
  IconBuildingBank,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconKey,
  IconLockSquareRounded,
  IconMail,
  IconRefresh,
  IconShieldLock,
  IconSpyOff,
} from "@tabler/icons-react";
import { motion, MotionConfig } from "motion/react";

import { cn } from "@repo/ui/lib/utils";

const gridBackground = {
  backgroundImage:
    "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

// --- Skeletons ---

const EncryptionSkeleton = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={gridBackground}
      />

      <div className="relative mb-6 flex w-full items-center justify-between gap-3">
        <div className="relative flex flex-col items-center gap-1.5">
          <div className="relative">
            <motion.div
              className="bg-primary absolute -inset-1.5 rounded-xl opacity-15"
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="border-primary/30 bg-primary/10 relative flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm">
              <IconLockSquareRounded className="text-primary size-5" />
            </div>
          </div>
          <span className="text-muted-foreground absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-medium tracking-widest uppercase">
            Client
          </span>
        </div>

        <div className="relative flex-1">
          <div className="bg-border h-px w-full opacity-60" />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2"
              animate={{ left: ["-4%", "104%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "linear",
              }}
            >
              <div className="bg-primary h-px w-5 rounded-full" />
            </motion.div>
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-1.5">
          <div className="relative">
            <motion.div
              className="bg-primary absolute -inset-1.5 rounded-xl opacity-15"
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 0.4 }}
            />
            <div className="border-border bg-muted/40 relative flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm">
              <IconShieldLock className="text-muted-foreground size-5" />
            </div>
          </div>
          <span className="text-muted-foreground absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-medium tracking-widest uppercase">
            Server
          </span>
        </div>
      </div>

      <div className="border-border bg-card/70 relative w-full overflow-hidden rounded-lg border p-2.5 backdrop-blur-sm">
        <motion.div
          className="from-primary/60 pointer-events-none absolute left-0 h-full w-px bg-linear-to-b via-transparent to-transparent"
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="bg-primary size-1.5 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-foreground text-[10px] font-medium">
              Encrypted
            </span>
          </div>
          <span className="text-muted-foreground font-mono text-[9px]">
            AES-256-GCM
          </span>
        </div>

        <div className="mt-1.5 space-y-1">
          <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
            <motion.div
              className="bg-primary/60 h-full rounded-full"
              animate={{ width: ["0%", "100%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="bg-muted h-1 w-3/4 overflow-hidden rounded-full">
            <motion.div
              className="bg-primary/30 h-full rounded-full"
              animate={{ width: ["0%", "100%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AutoFillSkeleton = () => {
  const [activeField, setActiveField] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveField((prev) => (prev + 1) % 2);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-3 overflow-hidden p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={gridBackground}
      />

      <div className="relative flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
          Email
        </span>
        <motion.div
          className="bg-card/70 relative flex h-8 w-full items-center overflow-hidden rounded-lg border px-2.5 backdrop-blur-sm"
          animate={{
            borderColor: activeField === 0 ? "var(--primary)" : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          {activeField === 0 && (
            <motion.div
              className="bg-primary absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <motion.span
            className="text-foreground/70 font-mono text-[10px]"
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            user@vaultcore.in
          </motion.span>
          {activeField === 0 && (
            <motion.div
              className="bg-primary ml-px h-3.5 w-px"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      <div className="relative flex flex-col gap-1">
        <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
          Password
        </span>
        <motion.div
          className="bg-card/70 relative flex h-8 w-full items-center gap-0.5 overflow-hidden rounded-lg border px-2.5 backdrop-blur-sm"
          animate={{
            borderColor: activeField === 1 ? "var(--primary)" : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          {activeField === 1 && (
            <motion.div
              className="bg-primary absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.08, duration: 0.15 }}
              className="bg-foreground/60 size-1.5 rounded-full"
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        className="bg-primary relative mt-1 flex h-7 w-20 items-center justify-center overflow-hidden rounded-lg"
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          }}
          animate={{ left: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 3 }}
        />
        <span className="text-primary-foreground relative text-[9px] font-medium">
          Sign in
        </span>
      </motion.div>
    </div>
  );
};

const VaultSkeleton = () => {
  const items = [
    { icon: IconMail, label: "gmail.com", type: "Login" },
    { icon: IconBuildingBank, label: "bank.com", type: "Card" },
    { icon: IconKey, label: "deploy-key", type: "SSH key" },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={gridBackground}
      />

      <div className="relative space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="border-border bg-card/70 relative flex items-center gap-2.5 rounded-lg border p-2 backdrop-blur-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
          >
            <div className="bg-primary/10 text-primary relative flex size-7 items-center justify-center rounded-md">
              <item.icon className="size-3.5" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-foreground/80 font-mono text-[11px]">
                {item.label}
              </div>
              <div className="text-muted-foreground text-[11px] tracking-wider uppercase">
                {item.type}
              </div>
            </div>

            <motion.div
              className="bg-primary size-1.5 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GeneratorSkeleton = () => {
  const [text, setText] = React.useState("a8F#k9!mXp2$");
  const [strength, setStrength] = React.useState(92);
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  React.useEffect(() => {
    const interval = setInterval(() => {
      setText(
        Array(14)
          .fill(0)
          .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
          .join(""),
      );
      setStrength(Math.floor(Math.random() * 15) + 85);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={gridBackground}
      />

      <div className="border-border bg-card/70 relative w-full overflow-hidden rounded-lg border p-3 backdrop-blur-sm">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          }}
          animate={{ left: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="flex items-center justify-between">
          <span className="text-foreground relative font-mono text-sm font-bold tracking-widest">
            {text}
          </span>
          <motion.div
            className="bg-primary/10 flex size-5 items-center justify-center rounded-md"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <IconRefresh className="text-primary size-3" />
          </motion.div>
        </div>
      </div>

      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[9px] font-medium tracking-widest uppercase">
            Strength
          </span>
          <span className="text-foreground font-mono text-[9px]">
            {strength}%
          </span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted h-1 flex-1 overflow-hidden rounded-full"
            >
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  i < 3 ? "bg-primary" : "bg-primary/30",
                )}
                animate={{ width: ["0%", "100%"] }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-border bg-card/50 flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5">
        {[
          { label: "Length", value: "14" },
          { label: "Entropy", value: "92b" },
          { label: "Crack", value: "∞" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-muted-foreground text-[11px] tracking-wider uppercase">
              {stat.label}
            </span>
            <motion.span
              className="text-foreground/80 font-mono text-[11px] font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {stat.value}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SyncSkeleton = () => {
  const devices = [
    { label: "Desktop", icon: IconDeviceDesktop },
    { label: "Mobile", icon: IconDeviceMobile },
    { label: "Tablet", icon: IconDeviceTablet },
  ];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={gridBackground}
      />

      <div className="relative">
        <motion.div
          className="bg-primary absolute -inset-3 rounded-full"
          animate={{ opacity: [0.05, 0.12, 0.05], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="border-primary/15 absolute -inset-6 rounded-full border"
          animate={{ opacity: [0.15, 0.3, 0.15], rotate: [0, 360] }}
          transition={{
            opacity: { duration: 2, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
        />
        <div className="border-primary/30 bg-primary/10 relative flex size-10 items-center justify-center rounded-full border backdrop-blur-sm">
          <IconShieldLock className="text-primary size-5" />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2 px-2">
        {devices.map((device, i) => (
          <div
            key={device.label}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="relative h-4 w-px">
              <div className="bg-border h-full w-full opacity-60" />
              <motion.div
                className="bg-primary absolute top-0 left-1/2 size-1 -translate-x-1/2 rounded-full"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            </div>

            <motion.div
              className="border-border bg-card/70 relative flex flex-col items-center gap-1 rounded-lg border px-3 py-2 backdrop-blur-sm"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
              }}
            >
              <device.icon className="text-muted-foreground size-4" />
              <span className="text-muted-foreground text-[8px] font-medium tracking-widest uppercase">
                {device.label}
              </span>
              <motion.div
                className="bg-primary size-1 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="border-primary/25 bg-primary/5 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm">
        <motion.div
          className="bg-primary size-1.5 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-foreground text-[9px] font-medium">Synced</span>
      </div>
    </div>
  );
};

const ZeroKnowledgeSkeleton = () => {
  const [hash, setHash] = React.useState("7f3a..b2c1");
  const hexChars = "0123456789abcdef";

  React.useEffect(() => {
    const interval = setInterval(() => {
      const h1 = Array(4)
        .fill(0)
        .map(() => hexChars.charAt(Math.floor(Math.random() * 16)))
        .join("");
      const h2 = Array(4)
        .fill(0)
        .map(() => hexChars.charAt(Math.floor(Math.random() * 16)))
        .join("");
      setHash(`${h1}..${h2}`);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative">
        <motion.div
          className="border-primary/15 absolute -inset-4 rounded-full border"
          animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="border-primary/10 absolute -inset-8 rounded-full border"
          animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        <div className="border-border bg-card/70 relative flex size-16 items-center justify-center overflow-hidden rounded-full border backdrop-blur-sm">
          <IconSpyOff className="text-muted-foreground size-7" />

          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, var(--primary) 10%, transparent 20%)",
              opacity: 0.1,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      <motion.div
        className="text-muted-foreground font-mono text-[10px]"
        key={hash}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        SHA-256: {hash}
      </motion.div>

      <div className="border-primary/25 bg-primary/5 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm">
        <motion.div
          className="bg-primary size-1.5 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-foreground text-[9px] font-medium">
          Zero access
        </span>
      </div>
    </div>
  );
};

const features = [
  {
    title: "End-to-end encryption",
    description:
      "Encrypted on your device with AES-256-GCM before anything leaves for our servers.",
    icon: IconShieldLock,
    className: "md:col-span-2",
    skeleton: <EncryptionSkeleton />,
  },
  {
    title: "One-click autofill",
    description:
      "Fill logins in your browser with the VaultCore extension. No copying, no typing.",
    icon: IconKey,
    className: "md:col-span-1",
    skeleton: <AutoFillSkeleton />,
  },
  {
    title: "One organized vault",
    description:
      "Logins, cards, identities, notes, and SSH keys in a single encrypted list.",
    icon: IconLockSquareRounded,
    className: "md:col-span-1",
    skeleton: <VaultSkeleton />,
  },
  {
    title: "Passwords worth keeping",
    description:
      "Generate long, unique passwords and let VaultCore remember them for you.",
    icon: IconRefresh,
    className: "md:col-span-1",
    skeleton: <GeneratorSkeleton />,
  },
  {
    title: "In sync everywhere",
    description:
      "Your vault follows you across devices, encrypted the whole way through.",
    icon: IconDeviceDesktop,
    className: "md:col-span-1",
    skeleton: <SyncSkeleton />,
  },
  {
    title: "Zero-knowledge by design",
    description:
      "Your keys stay on your device. The server only ever stores ciphertext.",
    icon: IconSpyOff,
    className: "md:col-span-2",
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "group border-border bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-xl motion-safe:hover:-translate-y-1",
        feature.className,
      )}
    >
      <div
        aria-hidden
        className="border-border bg-muted/20 relative h-52 w-full overflow-hidden border-b"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {feature.skeleton}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 items-center justify-center rounded-lg transition-colors duration-300">
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
            className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
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
