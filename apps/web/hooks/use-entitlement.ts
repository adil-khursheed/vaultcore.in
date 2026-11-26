"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

import type { EntitlementKey } from "@repo/auth/entitlements";

export function useEntitlement(
  key: EntitlementKey,
  organizationId: string | undefined,
) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.subscription.getCurrentActivePlan.queryOptions(
      { organizationId: organizationId ?? "" },
      { enabled: !!organizationId },
    ),
  );

  return {
    allowed: Boolean(query.data?.plan.entitlements?.[key]),
    isLoading: query.isLoading,
    plan: query.data?.plan,
  };
}
