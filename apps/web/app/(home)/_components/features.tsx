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
  const [cipher, setCipher] = React.useState("AES-256-GCM");
  const ciphers = ["AES-256-GCM"];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCipher(ciphers[Math.floor(Math.random() * ciphers.length)]!);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative flex w-full items-center justify-between gap-3">
        {/* Client Node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <motion.div
              className="absolute -inset-1.5 rounded-xl opacity-50"
              style={{ background: "var(--primary)" }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="border-primary/30 bg-primary/10 relative flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm">
              <IconLockSquareRounded className="text-primary size-5" />
            </div>
          </div>
          <span className="text-primary/70 text-[9px] font-medium tracking-widest uppercase">
            Client
          </span>
        </div>

        {/* Connection Line */}
        <div className="relative flex-1">
          {/* Base line with gradient */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--primary), var(--border), var(--primary))",
              opacity: 0.4,
            }}
          />
          {/* Animated data packets */}
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
              <div
                className="h-1.5 w-3 rounded-full"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 0 8px var(--primary), 0 0 16px var(--primary)",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Server Node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <motion.div
              className="absolute -inset-1.5 rounded-xl opacity-50"
              style={{ background: "var(--ring)" }}
              animate={{ opacity: [0.05, 0.2, 0.05] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="border-ring/30 bg-ring/10 relative flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm">
              <IconShieldLock className="text-ring size-5" />
            </div>
          </div>
          <span className="text-muted-foreground text-[9px] font-medium tracking-widest uppercase">
            Server
          </span>
        </div>
      </div>

      {/* Status Panel */}
      <div className="border-border/50 bg-card/50 relative w-full overflow-hidden rounded-lg border p-2.5 backdrop-blur-sm">
        {/* Panel scan line */}
        <motion.div
          className="pointer-events-none absolute left-0 h-full w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent, var(--primary), transparent)",
          }}
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="size-1.5 rounded-full bg-green-500"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-medium text-green-500">
              ENCRYPTED
            </span>
          </div>
          <motion.span
            className="text-primary/60 font-mono text-[9px]"
            key={cipher}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {cipher}
          </motion.span>
        </div>

        <div className="mt-1.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
              <motion.div
                className="bg-primary/50 h-full rounded-full"
                animate={{ width: ["0%", "100%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Email field */}
      <div className="relative flex flex-col gap-1">
        <span className="text-muted-foreground/70 text-[9px] font-medium tracking-widest uppercase">
          Email
        </span>
        <motion.div
          className="bg-card/50 relative flex h-8 w-full items-center overflow-hidden rounded-lg border px-2.5 backdrop-blur-sm"
          animate={{
            borderColor: activeField === 0 ? "var(--primary)" : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          {activeField === 0 && (
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ background: "var(--primary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0] }}
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

      {/* Password field */}
      <div className="relative flex flex-col gap-1">
        <span className="text-muted-foreground/70 text-[9px] font-medium tracking-widest uppercase">
          Password
        </span>
        <motion.div
          className="bg-card/50 relative flex h-8 w-full items-center gap-0.5 overflow-hidden rounded-lg border px-2.5 backdrop-blur-sm"
          animate={{
            borderColor: activeField === 1 ? "var(--primary)" : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          {activeField === 1 && (
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ background: "var(--primary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0] }}
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

      {/* Submit button */}
      <motion.div
        className="relative mt-1 flex h-7 w-20 items-center justify-center overflow-hidden rounded-lg"
        style={{ background: "var(--primary)" }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          }}
          animate={{ left: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 3 }}
        />
        <span className="text-primary-foreground text-[9px] font-medium">
          Sign In
        </span>
      </motion.div>
    </div>
  );
};

const VaultSkeleton = () => {
  const items = [
    { color: "#3b82f6", icon: "●", label: "gmail.com", type: "Login" },
    { color: "#f59e0b", icon: "◆", label: "bank.com", type: "Finance" },
    { color: "#22c55e", icon: "■", label: "ssh-key", type: "Secure Note" },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden p-4">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="group/item border-border/50 bg-card/50 relative flex items-center gap-2.5 rounded-lg border p-2 backdrop-blur-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
          >
            {/* Hover glow */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0"
              style={{ background: item.color }}
              animate={{ opacity: [0, 0.03, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
              }}
            />

            <div
              className="relative flex size-7 items-center justify-center rounded-md text-xs"
              style={{
                background: `${item.color}20`,
                color: item.color,
              }}
            >
              <motion.div
                className="absolute -inset-0.5 rounded-md"
                style={{ background: item.color }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
              <span className="relative">{item.icon}</span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-foreground/80 font-mono text-[10px]">
                {item.label}
              </div>
              <div className="text-muted-foreground/60 text-[8px] tracking-wider uppercase">
                {item.type}
              </div>
            </div>

            <motion.div
              className="size-1.5 rounded-full"
              style={{ background: item.color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
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
  const [strength, setStrength] = React.useState(85);
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
      setStrength(Math.floor(Math.random() * 20) + 80);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-5">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Password output */}
      <div className="border-border/50 bg-card/50 relative w-full overflow-hidden rounded-lg border p-3 backdrop-blur-sm">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
          }}
          animate={{ left: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="flex items-center justify-between">
          <span className="text-primary relative font-mono text-sm font-bold tracking-widest">
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

      {/* Strength meter */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[9px] font-medium tracking-widest uppercase">
            Strength
          </span>
          <span className="font-mono text-[9px] text-green-500">
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
                className="h-full rounded-full"
                style={{
                  background:
                    i < 3
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "linear-gradient(90deg, #22c55e40, #16a34a40)",
                }}
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

      {/* Stats row */}
      <div className="border-border/30 bg-card/30 flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5">
        {[
          { label: "Length", value: "14" },
          { label: "Entropy", value: "92b" },
          { label: "Crack", value: "∞" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-muted-foreground/60 text-[8px] tracking-wider uppercase">
              {stat.label}
            </span>
            <motion.span
              className="text-foreground/70 font-mono text-[10px] font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
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
    { label: "Desktop", icon: "🖥️" },
    { label: "Mobile", icon: "📱" },
    { label: "Tablet", icon: "📟" },
  ];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-4">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Central hub */}
      <div className="relative">
        <motion.div
          className="absolute -inset-3 rounded-full"
          style={{ background: "var(--primary)" }}
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="border-primary/10 absolute -inset-6 rounded-full border"
          animate={{ opacity: [0.1, 0.3, 0.1], rotate: [0, 360] }}
          transition={{
            opacity: { duration: 2, repeat: Infinity },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
        />
        <div className="border-primary/30 bg-primary/10 relative flex size-10 items-center justify-center rounded-full border backdrop-blur-sm">
          <IconShieldLock className="text-primary size-5" />
        </div>
      </div>

      {/* Device nodes */}
      <div className="flex w-full items-center justify-between gap-2 px-2">
        {devices.map((device, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            {/* Connection line to hub */}
            <div className="relative h-4 w-px">
              <div
                className="h-full w-full"
                style={{ background: "var(--border)", opacity: 0.5 }}
              />
              <motion.div
                className="absolute top-0 left-1/2 size-1 -translate-x-1/2 rounded-full"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 0 6px var(--primary)",
                }}
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
              className="border-border/50 bg-card/50 relative flex flex-col items-center gap-1 rounded-lg border px-3 py-2 backdrop-blur-sm"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
              }}
            >
              <span className="text-base">{device.icon}</span>
              <span className="text-muted-foreground text-[8px] font-medium tracking-widest uppercase">
                {device.label}
              </span>
              <motion.div
                className="size-1 rounded-full bg-green-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
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

      {/* Sync status */}
      <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/5 px-2.5 py-1 backdrop-blur-sm">
        <motion.div
          className="size-1.5 rounded-full bg-green-500"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] font-medium text-green-500">SYNCED</span>
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
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Outer pulsing ring */}
      <div className="relative">
        <motion.div
          className="border-primary/10 absolute -inset-4 rounded-full border"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="border-primary/5 absolute -inset-8 rounded-full border"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* Central icon */}
        <div className="border-border/50 bg-card/50 relative flex size-16 items-center justify-center overflow-hidden rounded-full border backdrop-blur-sm">
          <IconSpyOff className="text-muted-foreground/60 relative size-7" />

          {/* Rotating scanning line */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, var(--primary) 10%, transparent 20%)",
              opacity: 0.1,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Hash display */}
      <motion.div
        className="text-primary/50 font-mono text-[10px]"
        key={hash}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        SHA-256: {hash}
      </motion.div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/5 px-2.5 py-1 backdrop-blur-sm">
        <motion.div
          className="size-1.5 rounded-full bg-green-500"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] font-medium text-green-500">
          ZERO ACCESS
        </span>
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
    className: "md:col-span-2",
    skeleton: <EncryptionSkeleton />,
  },
  {
    title: "Auto-Fill Magic",
    description:
      "Log in to your favorite sites with a single click. No more typing.",
    icon: IconKey,
    className: "md:col-span-1",
    skeleton: <AutoFillSkeleton />,
  },
  {
    title: "Secure Vault",
    description: "Store passwords, notes, cards, and identities safely.",
    icon: IconLockSquareRounded,
    className: "md:col-span-1",
    skeleton: <VaultSkeleton />,
  },
  {
    title: "Password Generator",
    description: "Create unbreakable passwords with customizable complexity.",
    icon: IconRefresh,
    className: "md:col-span-1",
    skeleton: <GeneratorSkeleton />,
  },
  {
    title: "Cross-Device Sync",
    description: "Access your vault from any device. Real-time sync.",
    icon: IconDevices,
    className: "md:col-span-1",
    skeleton: <SyncSkeleton />,
  },
  {
    title: "Zero-Knowledge",
    description: "We know nothing about your data. Complete privacy.",
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group border-border bg-card relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-xl",
        feature.className,
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100",
        )}
      />

      {/* Glow effect on hover */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, var(--primary), transparent, var(--ring))",
          opacity: 0,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {/* Skeleton / Visual Area */}
      <div className="border-border/30 bg-muted/10 relative h-52 w-full overflow-hidden border-b">
        <div className="absolute inset-0 flex items-center justify-center">
          {feature.skeleton}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <feature.icon className="size-4.5" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
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

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default FeaturesSection;
