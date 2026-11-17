"use client";

import React, { useEffect, useState } from "react";
import {
  GoogleAnalytics,
  GoogleTagManager,
} from "@next/third-parties/google";

import { Button } from "@repo/ui/components/button";

import { siteUrl } from "../config";

const CONSENT_KEY = "vc-consent";
const CONSENT_EVENT = "vc-consent-reset";

type Consent = "granted" | "denied";

const readConsent = (): Consent | null => {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
};

const writeConsent = (value: Consent | null) => {
  try {
    if (value === null) localStorage.removeItem(CONSENT_KEY);
    else localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage unavailable (private mode): banner re-asks next visit
  }
};

// Analytics load only after the visitor consents; declining loads nothing.
const ConsentBanner = ({
  gaId,
  gtmId,
}: {
  gaId?: string;
  gtmId?: string;
}) => {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    setReady(true);
    setConsent(readConsent());

    const onReset = () => {
      writeConsent(null);
      setConsent(null);
    };
    window.addEventListener(CONSENT_EVENT, onReset);
    return () => window.removeEventListener(CONSENT_EVENT, onReset);
  }, []);

  const answer = (value: Consent | null) => {
    writeConsent(value);
    setConsent(value);
  };

  if ((!gaId && !gtmId) || !ready) return null;

  if (consent === null) {
    return (
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3"
      >
        <div className="border-border bg-background/95 mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border p-5 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            VaultCore loads Google Analytics only with your consent, to
            understand how this site is used. Declining keeps analytics off —
            your vault is not affected.{" "}
            <a
              href={`${siteUrl}/privacy`}
              className="text-foreground rounded-sm hover:underline"
            >
              Privacy policy
            </a>
            .
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={() => answer("denied")}>
              Decline
            </Button>
            <Button onClick={() => answer("granted")}>Accept</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {consent === "granted" ? (
        <>
          {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
          {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        </>
      ) : null}

      {/* Re-open consent: withdrawing must stay as easy as giving it */}
      <button
        onClick={() => answer(null)}
        className="text-muted-foreground hover:text-foreground border-border bg-background/80 focus-visible:ring-ring/50 fixed bottom-3 left-3 z-40 rounded-full border px-3 py-1.5 text-xs backdrop-blur-md outline-none transition-colors duration-200 focus-visible:ring-[3px]"
      >
        Cookie settings
      </button>
    </>
  );
};

export default ConsentBanner;
