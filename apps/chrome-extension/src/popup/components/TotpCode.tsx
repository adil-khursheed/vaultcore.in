import { useEffect, useState } from "react";
import { CopyButton } from "./CopyButton";

import {
  generateTotp,
  getTotpRemainingSeconds,
  parseTotpSecret,
} from "@repo/crypto";

interface TotpCodeProps {
  secret: string;
}

function formatCode(code: string) {
  const middle = Math.ceil(code.length / 2);
  return `${code.slice(0, middle)} ${code.slice(middle)}`;
}

/**
 * Live TOTP code for an `otpauth://` URI or Base32 secret. Falls back to
 * showing the raw secret if it cannot be parsed.
 */
export function TotpCode({ secret }: TotpCodeProps) {
  const [code, setCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(30);

  const config = (() => {
    try {
      return parseTotpSecret(secret);
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    let config: ReturnType<typeof parseTotpSecret>;
    try {
      config = parseTotpSecret(secret);
    } catch {
      return;
    }

    let cancelled = false;

    const update = async () => {
      const now = Date.now();
      setRemaining(getTotpRemainingSeconds(config.period, now));

      try {
        const next = await generateTotp(config, now);
        if (!cancelled) setCode(next);
      } catch {
        if (!cancelled) setCode(null);
      }
    };

    void update();
    const timer = setInterval(() => void update(), 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [secret]);

  if (!config) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground truncate font-mono text-sm">
          {secret}
        </span>
        <CopyButton text={secret} label="OTP secret" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground font-mono text-lg font-semibold tracking-[0.2em] tabular-nums">
          {code ? formatCode(code) : "•".repeat(config.digits)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            {remaining}s
          </span>
          {code && <CopyButton text={code} label="Authenticator code" />}
        </div>
      </div>
      <div className="bg-border h-1 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${(remaining / config.period) * 100}%` }}
        />
      </div>
    </div>
  );
}
