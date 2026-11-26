"use client";

import React from "react";
import {
  IconBrandGithub,
  IconCheck,
  IconCopy,
  IconCreditCard,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconKey,
  IconLock,
  IconPencil,
  IconRefresh,
  IconServer,
  IconShieldCheck,
  IconTerminal2,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@repo/ui/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Reveals a mock once, as its card scrolls into view. The delay staggers the
 * grid in reading order, so the section animates as one picture.
 */
export function useReveal(delay = 0) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    if (reduced) {
      setSeen(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => setSeen(true), delay);
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delay, reduced]);

  return [ref, seen] as const;
}

/**
 * The panel every mock sits in. It is anchored to the tile's bottom edge so the
 * window reads as cropped by the card rather than floating in the well.
 */
function Mock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-3 top-3 bottom-0 @min-[360px]:inset-x-4 @min-[360px]:top-4",
        className,
      )}
    >
      <div className="border-border bg-card flex h-full flex-col overflow-hidden rounded-t-xl border border-b-0">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="py-1 first:pt-0 last:pb-0">
      <p className="text-muted-foreground text-[9px] font-medium tracking-[0.1em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "text-foreground mt-0.5 truncate text-[11px]",
          mono && "font-mono tracking-wider",
        )}
      >
        {value}
      </p>
    </div>
  );
}

const CIPHERTEXT_SETS = [
  ["v1:9f2a·c41d·7b03", "v1:4d18·20ff·a6c2", "v1:77e0·b3a1·0f5c"],
  ["v1:8c41·2f9d·e0b7", "v1:3e9b·0a4c·71f2", "v1:a17f·9d04·5c2e"],
];

export function EncryptionVisual({
  hovered = false,
}: {
  seen?: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [cipherSet, setCipherSet] = React.useState(0);
  const [sealing, setSealing] = React.useState(false);

  React.useEffect(() => {
    if (!hovered) {
      setSealing(false);
      setCipherSet(0);
      return;
    }

    setSealing(true);
    const t1 = window.setTimeout(() => setCipherSet(1), reduced ? 0 : 220);
    const t2 = window.setTimeout(() => setSealing(false), reduced ? 0 : 650);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hovered, reduced]);

  const lines = CIPHERTEXT_SETS[cipherSet] ?? CIPHERTEXT_SETS[0]!;

  return (
    <Mock>
      <div className="border-border flex items-center gap-2.5 border-b px-3 py-2">
        <span className="bg-muted text-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <IconBrandGithub className="size-4" aria-hidden />
        </span>
        <p className="text-foreground min-w-0 flex-1 truncate text-[11px] font-semibold">
          GitHub
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium transition-colors duration-300",
            hovered
              ? "bg-mint/15 text-mint-ink dark:text-mint"
              : "text-muted-foreground bg-transparent",
          )}
        >
          <IconLock className="size-2.5" aria-hidden />
          {hovered ? (sealing ? "Encrypting" : "Sealed") : null}
        </span>
        <IconPencil
          className="text-muted-foreground size-3 shrink-0"
          aria-hidden
        />
      </div>

      <div className="relative flex flex-1">
        <div
          className={cn(
            "min-w-0 flex-1 px-3 py-2.5 transition-colors duration-300",
            sealing && "bg-mint/[0.04]",
          )}
        >
          <Field label="Username" value="alex@northwind.co" />
          <Field label="Password" value="••••••••••••" mono />
        </div>

        <div className="border-border bg-muted/40 relative hidden w-[46%] shrink-0 border-l px-3 py-2.5 @min-[420px]:block">
          {hovered && !reduced && (
            <motion.span
              key={`pulse-${cipherSet}`}
              initial={{ opacity: 0.9, scale: 0.6 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="bg-mint/30 pointer-events-none absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full"
              aria-hidden
            />
          )}
          <p className="text-muted-foreground text-[9px] font-medium tracking-[0.1em] uppercase">
            On our servers
          </p>
          <div className="text-muted-foreground mt-1.5 space-y-1 overflow-hidden font-mono text-[9px] leading-relaxed">
            {lines.map((line, idx) => (
              <AnimatePresence mode="wait" initial={false} key={idx}>
                <motion.p
                  key={line}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{
                    duration: 0.22,
                    delay: idx * 0.05,
                    ease: EASE,
                  }}
                  className={cn(
                    "transition-colors duration-300",
                    hovered && "text-foreground/80",
                  )}
                >
                  {line}
                </motion.p>
              </AnimatePresence>
            ))}
          </div>
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] transition-colors duration-300",
              hovered
                ? "border-mint/40 bg-mint/15 text-mint-ink dark:text-mint"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <IconLock className="size-2.5" aria-hidden />
            AES-256-GCM
          </span>
        </div>
      </div>

      <div className="border-border bg-muted/40 flex items-center justify-between border-t px-3 py-1.5 @min-[420px]:hidden">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[9px] transition-colors duration-300",
            hovered ? "text-mint-ink dark:text-mint" : "text-muted-foreground",
          )}
        >
          <IconLock className="size-2.5" aria-hidden />
          AES-256-GCM
        </span>
        <span className="text-muted-foreground font-mono text-[9px]">
          {lines[0]?.slice(0, 12)}
        </span>
      </div>
    </Mock>
  );
}

function MockInput({
  value,
  mono,
  on,
  highlight,
}: {
  value: string;
  mono?: boolean;
  on: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-muted/40 relative flex h-6 items-center rounded-md border px-2 transition-colors duration-300",
        highlight ? "border-mint/50 bg-mint/[0.06]" : "border-border",
      )}
    >
      <span
        className={cn(
          "bg-border h-1.5 w-16 rounded-full transition-opacity duration-200",
          on && "opacity-0",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "text-foreground absolute inset-y-0 left-2 flex items-center truncate text-[10px] transition-[opacity,transform] duration-300 ease-out",
          mono && "font-mono tracking-wider",
          on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function AutofillVisual({
  seen,
  hovered = false,
}: {
  seen: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = React.useState<
    "idle" | "clicking" | "filling" | "ready"
  >("idle");

  React.useEffect(() => {
    if (!hovered) {
      setPhase("idle");
      return;
    }

    if (reduced) {
      setPhase("ready");
      return;
    }

    setPhase("clicking");
    const t1 = window.setTimeout(() => setPhase("filling"), 220);
    const t2 = window.setTimeout(() => setPhase("ready"), 620);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hovered, reduced]);

  const showUser = hovered ? phase === "filling" || phase === "ready" : seen;
  const showPass = hovered ? phase === "ready" : seen;
  const isReady = hovered && phase === "ready";
  const isClicking = hovered && phase === "clicking";

  return (
    <Mock>
      <div className="border-border bg-muted/40 flex items-center gap-2 border-b px-2.5 py-1.5">
        <span className="flex shrink-0 gap-1" aria-hidden>
          <span className="bg-border size-1.5 rounded-full" />
          <span className="bg-border size-1.5 rounded-full" />
          <span className="bg-border size-1.5 rounded-full" />
        </span>
        <span className="border-border bg-card flex h-4.5 min-w-0 flex-1 items-center gap-1 rounded border px-1.5">
          <IconLock
            className="text-muted-foreground size-2.5 shrink-0"
            aria-hidden
          />
          <span className="text-muted-foreground truncate text-[9px]">
            github.com/login
          </span>
        </span>
      </div>

      <div
        className={cn(
          "border-border bg-mint/10 flex items-center gap-1.5 border-b px-2.5 py-1.5 transition-[opacity,transform] duration-500 ease-out",
          seen || hovered
            ? "translate-y-0 opacity-100"
            : "-translate-y-1 opacity-0",
        )}
      >
        <IconLock
          className="text-mint-ink dark:text-mint size-3 shrink-0"
          aria-hidden
        />
        <span className="text-foreground min-w-0 flex-1 truncate text-[9px]">
          alex@northwind.co
        </span>
        <span
          className={cn(
            "bg-mint text-mint-ink inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-medium transition-transform duration-150",
            isClicking && "scale-90",
          )}
        >
          {isReady ? (
            <>
              <IconCheck className="size-2.5" aria-hidden />
              Filled
            </>
          ) : (
            "Fill"
          )}
        </span>
      </div>

      <div className="px-3 pt-2.5 pb-3">
        <p className="text-foreground text-center text-[10px] font-semibold">
          Sign in to GitHub
        </p>
        <div className="mt-2 space-y-1.5">
          <MockInput
            value="alex@northwind.co"
            on={showUser}
            highlight={hovered && phase === "filling"}
          />
          <MockInput
            value="••••••••••••"
            mono
            on={showPass}
            highlight={isReady}
          />
          <div
            className={cn(
              "bg-mint text-mint-ink flex h-5 items-center justify-center gap-1 rounded text-[9px] font-medium transition-transform duration-200",
              isReady && "ring-mint/40 ring-2",
            )}
          >
            {isReady ? (
              <>
                <IconCheck className="size-2.5" aria-hidden />
                Signed in
              </>
            ) : (
              "Sign in"
            )}
          </div>
        </div>
      </div>
    </Mock>
  );
}

const VAULT_ROWS = [
  {
    name: "GitHub",
    detail: "alex@northwind.co",
    type: "Login",
    icon: IconBrandGithub,
    selected: true,
  },
  {
    name: "Travel card",
    detail: "•• 4242",
    type: "Card",
    icon: IconCreditCard,
  },
  {
    name: "aws-prod",
    detail: "ed25519",
    type: "SSH key",
    icon: IconTerminal2,
  },
];

export function VaultVisual({
  hovered = false,
}: {
  seen?: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!hovered || reduced) {
      setActiveIndex(0);
      return;
    }

    const first = window.setTimeout(() => setActiveIndex(1), 280);
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VAULT_ROWS.length);
    }, 1150);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [hovered, reduced]);

  const activeType = VAULT_ROWS[activeIndex]?.type ?? "Login";

  return (
    <Mock>
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <span className="text-foreground text-[11px] font-semibold">
          {hovered ? `${activeType}s` : "All items"}
        </span>
        <span className="text-muted-foreground text-[9px] tabular-nums">
          {hovered ? "1 / 24" : "24"}
        </span>
      </div>

      <div className="space-y-0.5 p-1.5">
        {VAULT_ROWS.map((row, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={row.name}
              onMouseEnter={() => setActiveIndex(index)}
              className="relative flex items-center gap-2 rounded-md px-2 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="vault-active-row"
                  transition={{ duration: 0.28, ease: EASE }}
                  className="bg-muted/70 border-mint/35 pointer-events-none absolute inset-0 rounded-md border"
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-200",
                  isActive
                    ? "bg-mint/15 text-mint-ink dark:text-mint"
                    : "bg-muted text-foreground",
                )}
              >
                <row.icon className="size-3.5" aria-hidden />
              </span>
              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-foreground truncate text-[10px] font-medium">
                  {row.name}
                </p>
                <p className="text-muted-foreground truncate text-[9px]">
                  {row.detail}
                </p>
              </div>
              <span
                className={cn(
                  "relative z-10 shrink-0 rounded-full px-1.5 py-0.5 text-[8px] leading-none transition-colors duration-200",
                  isActive
                    ? "bg-mint text-mint-ink font-medium"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {row.type}
              </span>
            </div>
          );
        })}

        {[0, 1].map((index) => (
          <div key={index} className="flex items-center gap-2 px-2 py-1.5">
            <span className="bg-muted size-6 shrink-0 rounded" aria-hidden />
            <div className="min-w-0 flex-1 space-y-1" aria-hidden>
              <span
                className="bg-muted block h-1.5 rounded-full"
                style={{ width: 52 + index * 14 }}
              />
              <span className="bg-muted block h-1.5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Mock>
  );
}

const GENERATOR_CHIPS = ["A-Z", "0-9", "!@#"];
const GENERATED_PASSWORDS = [
  { value: "kR7#vQ2m@Xp9Lw4Tz6", length: 20, pct: "75%" },
  { value: "mN4$pL9x!Qr2Vz8Kw3", length: 24, pct: "88%" },
  { value: "tY6&bC3n#Wj8Hs5Pd9", length: 18, pct: "65%" },
  { value: "xV2@qM7f!Zn4Kc6Rt8", length: 22, pct: "82%" },
];

export function GeneratorVisual({
  seen,
  hovered = false,
}: {
  seen: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [pwIndex, setPwIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!hovered) {
      setCopied(false);
      return;
    }

    setPwIndex((prev) => (prev + 1) % GENERATED_PASSWORDS.length);
    const t = window.setTimeout(() => setCopied(true), reduced ? 0 : 280);
    const t2 = window.setTimeout(() => setCopied(false), 1400);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [hovered, reduced]);

  const current = GENERATED_PASSWORDS[pwIndex] ?? GENERATED_PASSWORDS[0]!;

  return (
    <Mock>
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-[11px] font-semibold">
            Generator
          </span>
          <motion.span
            animate={{ rotate: hovered && !reduced ? pwIndex * 180 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="inline-flex"
          >
            <IconRefresh
              className={cn(
                "size-3 transition-colors duration-200",
                hovered ? "text-foreground" : "text-muted-foreground",
              )}
              aria-hidden
            />
          </motion.span>
        </div>

        <div
          className={cn(
            "bg-muted/40 mt-2 flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors duration-300",
            copied ? "border-mint/50 bg-mint/[0.06]" : "border-border",
          )}
        >
          <div className="min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={current.value}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="text-foreground block truncate font-mono text-[11px] tracking-tight"
              >
                {current.value}
              </motion.span>
            </AnimatePresence>
          </div>
          {copied ? (
            <IconCheck
              className="text-mint-ink dark:text-mint ml-auto size-3 shrink-0"
              aria-hidden
            />
          ) : (
            <IconCopy
              className="text-muted-foreground ml-auto size-3 shrink-0"
              aria-hidden
            />
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-1">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-500",
                seen || hovered ? "bg-mint" : "bg-border",
              )}
              style={{ transitionDelay: `${index * 90}ms` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px]">
          <span className="text-muted-foreground">Strength</span>
          <span className="text-foreground font-medium">
            {copied ? "Copied" : "Strong"}
          </span>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">Length</span>
            <span className="text-foreground tabular-nums">
              {current.length}
            </span>
          </div>
          <div className="bg-border relative mt-1.5 h-1 rounded-full">
            <span
              className="bg-foreground/70 absolute inset-y-0 left-0 rounded-full transition-[width] duration-400 ease-out"
              style={{ width: current.pct }}
            />
            <span
              className="border-border bg-card absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[left] duration-400 ease-out"
              style={{ left: current.pct }}
            />
          </div>
        </div>

        <div className="mt-2.5 flex gap-1">
          {GENERATOR_CHIPS.map((chip) => (
            <span
              key={chip}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[9px] transition-colors duration-200",
                hovered
                  ? "border-mint/35 bg-mint/10 text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </Mock>
  );
}

const DEVICES = [
  { name: "MacBook Pro", when: "Just now", icon: IconDeviceLaptop },
  { name: "iPhone", when: "1m ago", icon: IconDeviceMobile },
  { name: "Windows PC", when: "2m ago", icon: IconDeviceDesktop },
];

export function SyncVisual({
  seen,
  hovered = false,
}: {
  seen: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [syncing, setSyncing] = React.useState(false);
  const [syncedCount, setSyncedCount] = React.useState(0);

  React.useEffect(() => {
    if (!hovered) {
      setSyncing(false);
      setSyncedCount(0);
      return;
    }

    if (reduced) {
      setSyncing(false);
      setSyncedCount(DEVICES.length);
      return;
    }

    setSyncing(true);
    setSyncedCount(0);
    const timers = DEVICES.map((_, idx) =>
      window.setTimeout(() => setSyncedCount(idx + 1), 180 + idx * 180),
    );
    const doneTimer = window.setTimeout(() => setSyncing(false), 740);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(doneTimer);
    };
  }, [hovered, reduced]);

  return (
    <Mock>
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <span className="text-foreground text-[11px] font-semibold">
          Devices
        </span>
        <span className="text-mint-ink bg-mint/15 dark:text-mint inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium">
          {syncing ? (
            <>
              <IconRefresh className="size-2.5 animate-spin" aria-hidden />
              Syncing
            </>
          ) : (
            <>
              <IconCheck className="size-2.5" aria-hidden />
              Synced
            </>
          )}
        </span>
      </div>

      <div className="space-y-0.5 p-1.5">
        {DEVICES.map((device, index) => {
          const isUpdated = hovered && index < syncedCount;
          return (
            <div
              key={device.name}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 transition-colors duration-300",
                isUpdated && "bg-mint/[0.06]",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-300",
                  isUpdated
                    ? "bg-mint/15 text-mint-ink dark:text-mint"
                    : "bg-muted text-foreground",
                )}
              >
                <device.icon className="size-3.5" aria-hidden />
              </span>
              <span className="text-foreground min-w-0 flex-1 truncate text-[10px] font-medium">
                {device.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[9px] transition-colors duration-300",
                  isUpdated
                    ? "text-mint-ink dark:text-mint font-medium"
                    : "text-muted-foreground",
                )}
              >
                {isUpdated ? "Just now" : device.when}
              </span>
              <IconCheck
                className={cn(
                  "text-mint-ink dark:text-mint size-3 shrink-0 transition-[opacity,transform] duration-300",
                  seen || hovered ? "opacity-100" : "opacity-0",
                  isUpdated && !reduced && "scale-110",
                )}
                style={{
                  transitionDelay: hovered ? "0ms" : `${index * 120}ms`,
                }}
                aria-hidden
              />
            </div>
          );
        })}
      </div>
    </Mock>
  );
}

const SERVER_HASHES = ["8c41 2f9d e0b7", "3e9b 0a4c 71f2"];

export function ZeroKnowledgeVisual({
  hovered = false,
}: {
  seen?: boolean;
  hovered?: boolean;
}) {
  const reduced = useReducedMotion();
  const [pulseCount, setPulseCount] = React.useState(0);

  React.useEffect(() => {
    if (!hovered || reduced) {
      setPulseCount(0);
      return;
    }

    const first = window.setTimeout(() => setPulseCount(1), 240);
    const interval = window.setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 2000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [hovered, reduced]);

  const currentHash =
    SERVER_HASHES[pulseCount % SERVER_HASHES.length] ?? SERVER_HASHES[0]!;

  return (
    <div className="absolute inset-0 flex items-center px-3 @min-[420px]:px-6">
      <div className="flex w-full items-stretch gap-1.5 @min-[420px]:gap-2">
        <div
          className={cn(
            "bg-card min-w-0 flex-1 rounded-lg border p-2.5 transition-colors duration-300 @min-[420px]:p-3",
            hovered ? "border-mint/45" : "border-border",
          )}
        >
          <div className="text-foreground flex items-center gap-1.5 text-[9px] font-medium @min-[480px]:text-[10px]">
            <IconKey
              className={cn(
                "size-3 shrink-0 transition-colors duration-300",
                hovered && "text-mint-ink dark:text-mint",
              )}
              aria-hidden
            />
            Your device
          </div>
          <p className="text-foreground mt-2 font-mono text-[9px] tracking-tight @min-[480px]:text-[10px]">
            4F2A 9C1D 7B03
          </p>
          <p
            className={cn(
              "mt-1 text-[9px] leading-snug transition-colors duration-300",
              hovered
                ? "text-mint-ink dark:text-mint"
                : "text-muted-foreground",
            )}
          >
            Master key never leaves
          </p>
        </div>

        <div className="relative flex w-5 shrink-0 items-center justify-center overflow-hidden @min-[420px]:w-8">
          <span className="bg-border h-px w-full" aria-hidden />
          {hovered && !reduced && (
            <motion.span
              key={pulseCount}
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 16, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.75, ease: EASE }}
              className="bg-mint absolute size-1.5 rounded-full"
              aria-hidden
            />
          )}
          <span
            className={cn(
              "bg-card relative z-10 flex size-5 items-center justify-center rounded-full border transition-colors duration-300",
              hovered
                ? "border-mint/50 text-mint-ink dark:text-mint"
                : "border-border text-muted-foreground",
            )}
          >
            <IconLock className="size-2.5" aria-hidden />
          </span>
        </div>

        <div className="border-border bg-card min-w-0 flex-1 rounded-lg border p-2.5 @min-[420px]:p-3">
          <div className="text-foreground flex items-center gap-1.5 text-[9px] font-medium @min-[480px]:text-[10px]">
            <IconServer className="size-3 shrink-0" aria-hidden />
            VaultCore
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={currentHash}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -3 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="text-foreground mt-2 font-mono text-[9px] tracking-tight @min-[480px]:text-[10px]"
            >
              {currentHash}
            </motion.p>
          </AnimatePresence>
          <p className="text-muted-foreground mt-1 text-[9px] leading-snug">
            Cannot decrypt
          </p>
        </div>
      </div>
    </div>
  );
}

const SAFETY_NUMBERS = [
  "48291 30477",
  "61502 98314",
  "20486 55129",
  "73910 64208",
];

/** The key-verification dialog the security section uses as its one picture. */
export function VerifyKeyVisual() {
  return (
    <div
      className="border-border bg-card overflow-hidden rounded-xl border shadow-sm"
      aria-hidden
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-foreground text-xs font-semibold">
          Verify Alex&apos;s key
        </span>
        <IconX className="text-muted-foreground size-3.5" aria-hidden />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <span className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium">
            AR
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-xs font-medium">Alex Rivera</p>
            <p className="text-muted-foreground truncate text-[11px]">
              alex@northwind.co
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mt-3 text-[11px] leading-relaxed">
          Compare these numbers with Alex in person or on a call. If they match,
          no one swapped the key in between.
        </p>

        <div className="border-border bg-border mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border">
          {SAFETY_NUMBERS.map((number) => (
            <span
              key={number}
              className="bg-card text-foreground px-3 py-2 font-mono text-[11px] tracking-[0.08em]"
            >
              {number}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
            <IconShieldCheck className="size-3.5" aria-hidden />
            Out-of-band
          </span>
          <span className="bg-mint text-mint-ink rounded-md px-2.5 py-1.5 text-[11px] font-medium">
            Mark as verified
          </span>
        </div>
      </div>
    </div>
  );
}
