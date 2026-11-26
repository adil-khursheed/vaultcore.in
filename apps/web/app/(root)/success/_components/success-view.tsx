"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Vault } from "@lucasmarkes/hairline/react";
import {
  ArrowRight,
  Check,
  KeyRound,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

export interface SuccessSummary {
  planName: string;
  planId: string;
  yearlyPriceUsd: number | null;
  organizationName: string | null;
  organizationSlug: string | null;
  maxOrgsPerUser: number | null;
  maxMembersPerOrg: number | null;
  features: string[];
  checkoutId: string | null;
  hasHealthReports: boolean;
}

function formatPrice(cents: number | null): string {
  if (cents === null) return "";
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}/yr` : `$${dollars.toFixed(2)}/yr`;
}

export default function SuccessView({ summary }: { summary: SuccessSummary }) {
  const [vaultReadout, setVaultReadout] = useState("rest");
  const [selectedPreview, setSelectedPreview] = useState<"health" | "sharing">(
    summary.hasHealthReports ? "health" : "sharing",
  );

  const vaultHref = summary.organizationSlug
    ? `/${summary.organizationSlug}/all-items`
    : "/app";
  const healthHref = summary.organizationSlug
    ? `/${summary.organizationSlug}/health`
    : "/app";
  const membersHref = summary.organizationSlug
    ? `/${summary.organizationSlug}/members`
    : "/app";

  const priceLabel = formatPrice(summary.yearlyPriceUsd);

  return (
    <main className="bg-background text-foreground min-h-[calc(100vh-48px)] w-full px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        {/* Top confirmation & interactive Hairline vault */}
        <section className="border-border bg-card grid overflow-hidden rounded-xl border shadow-sm lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="bg-primary text-primary-foreground gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                  <Check className="size-3.5" aria-hidden="true" />
                  Plan active
                </Badge>
                {priceLabel && (
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">
                    {summary.planName} · {priceLabel}
                  </span>
                )}
              </div>

              <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                {summary.organizationName
                  ? `${summary.organizationName} is now on ${summary.planName}`
                  : `Welcome to VaultCore ${summary.planName}`}
              </h1>

              <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
                Your subscription is active and your organization&apos;s
                entitlements have been updated. All vault secrets remain
                encrypted on your device.
              </p>

              {summary.features.length > 0 && (
                <ul className="border-border grid gap-2.5 border-t pt-5 sm:grid-cols-2">
                  {summary.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      <Check
                        className="text-primary size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link href={vaultHref}>
                  Open Vault
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              {summary.hasHealthReports && (
                <Button asChild variant="outline" size="lg">
                  <Link href={healthHref}>
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Run Password Health
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Hairline Vault figure */}
          <div className="border-border bg-muted/40 flex flex-col justify-between border-t p-6 lg:col-span-5 lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Vault Dial
              </span>
              <span className="border-border bg-background text-foreground rounded-full border px-2.5 py-0.5 font-mono text-xs tabular-nums">
                {vaultReadout}
              </span>
            </div>

            <div className="my-4 flex min-h-[240px] items-center justify-center">
              <Vault
                play
                intensity={0.65}
                onRead={setVaultReadout}
                label="Interactive isometric vault door — circle the dial to unlock"
                className="h-[240px] w-full max-w-[300px]"
              />
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Circle the dial with your pointer to draw back the bolts.
            </p>
          </div>
        </section>

        {/* Stageshow-style miniature product preview of what unlocked */}
        <section className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
          <div className="border-border flex flex-col justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-base font-semibold">
                What&apos;s unlocked in your workspace
              </h2>
              <p className="text-muted-foreground text-xs">
                Preview the features now active for{" "}
                {summary.organizationName ?? "your organization"}.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={selectedPreview === "health" ? "default" : "outline"}
                onClick={() => setSelectedPreview("health")}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Password Health
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedPreview === "sharing" ? "default" : "outline"}
                onClick={() => setSelectedPreview("sharing")}
              >
                <Users className="size-3.5" aria-hidden="true" />
                Team &amp; Limits
              </Button>
            </div>
          </div>

          {/* Cropped Stageshow miniature app window */}
          <div className="bg-muted/30 px-6 pt-6 sm:px-10 sm:pt-8">
            <div className="border-border bg-background overflow-hidden rounded-t-xl border border-b-0 shadow-sm">
              {/* Window chrome */}
              <div className="border-border flex h-10 items-center justify-between border-b px-4">
                <div className="flex items-center gap-1.5">
                  <span className="bg-border size-2.5 rounded-full" />
                  <span className="bg-border size-2.5 rounded-full" />
                  <span className="bg-border size-2.5 rounded-full" />
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  dash.vaultcore.in/
                  {summary.organizationSlug ?? "vault"}/
                  {selectedPreview === "health" ? "health" : "members"}
                </span>
                <span className="w-8" />
              </div>

              {/* Miniature split layout: quiet sidebar + active content */}
              <div className="grid sm:grid-cols-12">
                <div className="border-border hidden space-y-2.5 border-r p-4 sm:col-span-3 sm:block">
                  <div className="bg-muted h-3 w-20 rounded" />
                  <div className="space-y-1.5 pt-2">
                    <div className="bg-muted/70 h-2.5 w-24 rounded" />
                    <div className="bg-muted/70 h-2.5 w-16 rounded" />
                    <div
                      className={
                        selectedPreview === "health"
                          ? "bg-primary/25 h-2.5 w-28 rounded"
                          : "bg-muted/70 h-2.5 w-28 rounded"
                      }
                    />
                    <div
                      className={
                        selectedPreview === "sharing"
                          ? "bg-primary/25 h-2.5 w-20 rounded"
                          : "bg-muted/70 h-2.5 w-20 rounded"
                      }
                    />
                  </div>
                </div>

                <div className="p-5 sm:col-span-9 sm:p-6">
                  {selectedPreview === "health" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            className="text-primary size-4"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-semibold">
                            Password Health
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          Zero-knowledge scan
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="border-border rounded-lg border p-3">
                          <span className="text-muted-foreground text-[11px]">
                            Weak
                          </span>
                          <p className="mt-1 text-lg font-semibold tabular-nums">
                            Detect
                          </p>
                        </div>
                        <div className="border-border rounded-lg border p-3">
                          <span className="text-muted-foreground text-[11px]">
                            Reused
                          </span>
                          <p className="mt-1 text-lg font-semibold tabular-nums">
                            Group
                          </p>
                        </div>
                        <div className="border-border rounded-lg border p-3">
                          <span className="text-muted-foreground text-[11px]">
                            Outdated
                          </span>
                          <p className="mt-1 text-lg font-semibold tabular-nums">
                            &gt;180d
                          </p>
                        </div>
                      </div>

                      <div className="border-border flex items-center justify-between rounded-lg border px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <KeyRound
                            className="text-muted-foreground size-4"
                            aria-hidden="true"
                          />
                          <div className="space-y-1">
                            <div className="bg-muted h-2.5 w-28 rounded" />
                            <div className="bg-muted/70 h-2 w-20 rounded" />
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={healthHref}>Open Health</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Users
                            className="text-primary size-4"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-semibold">
                            Organization Capacity
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          {summary.planName}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border-border rounded-lg border p-3">
                          <span className="text-muted-foreground text-[11px]">
                            Organizations
                          </span>
                          <p className="mt-1 text-lg font-semibold tabular-nums">
                            {summary.maxOrgsPerUser === null
                              ? "Unlimited"
                              : `Up to ${summary.maxOrgsPerUser}`}
                          </p>
                        </div>
                        <div className="border-border rounded-lg border p-3">
                          <span className="text-muted-foreground text-[11px]">
                            Members per org
                          </span>
                          <p className="mt-1 text-lg font-semibold tabular-nums">
                            {summary.maxMembersPerOrg === null
                              ? "Unlimited"
                              : `Up to ${summary.maxMembersPerOrg}`}
                          </p>
                        </div>
                      </div>

                      <div className="border-border flex items-center justify-between rounded-lg border px-3.5 py-2.5">
                        <span className="text-muted-foreground text-xs">
                          Invite family or teammates with RSA-4096 key sharing
                        </span>
                        <Button asChild size="sm" variant="outline">
                          <Link href={membersHref}>Manage Members</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer metadata */}
        <footer className="text-muted-foreground flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
          <span>
            {summary.checkoutId ? (
              <>
                Checkout reference:{" "}
                <span className="text-foreground font-mono">
                  {summary.checkoutId}
                </span>
              </>
            ) : (
              "A receipt has been sent to your billing email."
            )}
          </span>
          <span>
            Need help?{" "}
            <Link
              href="mailto:support@vaultcore.in"
              className="text-foreground underline underline-offset-4"
            >
              support@vaultcore.in
            </Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
