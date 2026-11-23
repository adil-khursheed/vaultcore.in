"use client";

import { useEffect } from "react";

import { useVaultStore } from "@repo/store";

/**
 * Activity events that count as "the user is still here". `visibilitychange`
 * is handled separately so switching back to the tab also counts.
 */
const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
] as const;

/** Don't write to the store on every mousemove/tick — 30s resolution is plenty. */
const THROTTLE_MS = 30_000;

/**
 * Keeps the vault's `lastActivity` timestamp fresh while the user interacts
 * with the app. Without this, the auto-lock timer only measures time since
 * unlock and locks the vault mid-use.
 */
export function useActivityTracker() {
  const isLocked = useVaultStore((state) => state.isLocked);
  const refreshActivity = useVaultStore((state) => state.refreshActivity);

  useEffect(() => {
    if (isLocked) return;

    let lastRefresh = 0;

    const markActivity = () => {
      const now = Date.now();
      if (now - lastRefresh < THROTTLE_MS) return;
      lastRefresh = now;
      refreshActivity();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        markActivity();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // Treat mounting the protected area as activity.
    markActivity();

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActivity);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLocked, refreshActivity]);
}
