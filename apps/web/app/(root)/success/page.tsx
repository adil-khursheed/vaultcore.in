import React from "react";
import { getSession } from "@/lib/auth/server";

import { syncPolarCheckout } from "@repo/auth";
import { getOrgPlan } from "@repo/auth/entitlements";
import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { organization } from "@repo/db/schema";

import SuccessView, { type SuccessSummary } from "./_components/success-view";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const { checkout_id } = await searchParams;
  const session = await getSession();

  let syncedOrgId: string | null = session?.session.activeOrganizationId ?? null;

  if (checkout_id && session?.user) {
    try {
      const result = await syncPolarCheckout(checkout_id, session.user.id);
      if (result?.organizationId) {
        syncedOrgId = result.organizationId;
      }
    } catch (error) {
      console.error("[SUCCESS] Failed to sync Polar checkout", error);
    }
  }

  let summary: SuccessSummary = {
    planName: "Premium",
    planId: "premium",
    yearlyPriceUsd: null,
    organizationName: null,
    organizationSlug: null,
    maxOrgsPerUser: null,
    maxMembersPerOrg: null,
    features: [],
    checkoutId: checkout_id ?? null,
    hasHealthReports: true,
  };

  if (syncedOrgId) {
    const [orgRow, plan] = await Promise.all([
      db.query.organization.findFirst({
        where: eq(organization.id, syncedOrgId),
      }),
      getOrgPlan(syncedOrgId),
    ]);

    summary = {
      planName: plan.name,
      planId: plan.id,
      yearlyPriceUsd: plan.yearlyPriceUsd,
      organizationName: orgRow?.name ?? null,
      organizationSlug: orgRow?.slug ?? null,
      maxOrgsPerUser: plan.maxOrgsPerUser,
      maxMembersPerOrg: plan.maxMembersPerOrg,
      features: plan.features ?? [],
      checkoutId: checkout_id ?? null,
      hasHealthReports: Boolean(plan.entitlements?.healthReports),
    };
  }

  return <SuccessView summary={summary} />;
}
