"use client";

import React from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  generateTotp,
  getTotpRemainingSeconds,
  parseTotpSecret,
} from "@repo/crypto";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

function formatCode(code: string) {
  const middle = Math.ceil(code.length / 2);
  return `${code.slice(0, middle)} ${code.slice(middle)}`;
}

/**
 * Renders a live TOTP code for a stored authenticator secret.
 *
 * Accepts either a raw Base32 secret or an `otpauth://` URI. If the stored
 * value is not a valid secret, it falls back to showing the raw value so the
 * user can still copy it.
 */
export function TotpField({ secret }: { secret?: string | null }) {
  const [code, setCode] = React.useState<string | null>(null);
  const [remaining, setRemaining] = React.useState(30);
  const [copied, setCopied] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const config = React.useMemo(() => {
    if (!secret) return null;
    try {
      return parseTotpSecret(secret);
    } catch {
      return null;
    }
  }, [secret]);

  React.useEffect(() => {
    if (!config) return;

    let cancelled = false;

    const update = async () => {
      const now = Date.now();
      setRemaining(getTotpRemainingSeconds(config.period, now));

      try {
        const next = await generateTotp(config, now);
        if (!cancelled) {
          setCode(next);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    void update();
    const timer = setInterval(() => void update(), 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [config]);

  if (!secret) return null;

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Authenticator code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  if (!config || failed) {
    return (
      <div className="bg-accent/30 flex shrink-0 flex-col gap-1.5 rounded-lg p-3">
        <span className="text-muted-foreground text-xs font-medium">
          Authenticator (OTP)
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">
            {secret}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Copy OTP secret"
            title="Copy OTP secret"
            onClick={() => void handleCopy(secret)}
          >
            {copied ? (
              <IconCheck className="text-primary size-4" aria-hidden="true" />
            ) : (
              <IconCopy className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Not a valid TOTP secret, so no codes can be generated. You can still
          copy the stored value.
        </p>
      </div>
    );
  }

  const progress = Math.max(
    0,
    Math.min(100, (remaining / config.period) * 100),
  );

  return (
    <div className="bg-accent/30 flex shrink-0 flex-col gap-1.5 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          Authenticator code
        </span>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {remaining}s
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className="font-mono text-2xl font-semibold tracking-[0.2em] tabular-nums"
          aria-live="polite"
          aria-label={`Authenticator code ${code ?? "loading"}`}
        >
          {code ? formatCode(code) : "•".repeat(config.digits)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Copy authenticator code"
          title="Copy authenticator code"
          disabled={!code}
          onClick={() => code && void handleCopy(code)}
        >
          {copied ? (
            <IconCheck className="text-primary size-4" aria-hidden="true" />
          ) : (
            <IconCopy className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="bg-border h-1 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "bg-primary h-full transition-[width] duration-1000 ease-linear",
            remaining <= 5 && "bg-destructive",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
