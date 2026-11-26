"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

import ConfirmDialog from "../../../_components/confirm-dialog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export default function SubscriptionSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const organizationId = activeOrg?.id ?? "";
  const currentMember = activeOrg?.members.find(
    (member) => member.userId === session?.user.id,
  );
  const isAdmin = (currentMember?.role ?? "")
    .split(",")
    .map((r) => r.trim())
    .some((r) => r === "owner" || r === "admin");

  const { data, isLoading } = useQuery(
    trpc.subscription.getCurrentActivePlan.queryOptions(
      { organizationId },
      { enabled: !!organizationId },
    ),
  );

  const cancelMutation = useMutation(
    trpc.subscription.cancelSubscription.mutationOptions({
      onSuccess: async () => {
        toast.success(
          "Subscription canceled. Your benefits remain active until the end of the billing period.",
        );
        setConfirmOpen(false);
        await queryClient.invalidateQueries({
          queryKey: trpc.subscription.getCurrentActivePlan.pathKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't cancel the subscription.");
      },
    }),
  );

  if (!activeOrg || isLoading || !data) return null;

  const { plan, subscription } = data;
  const isPaid =
    !!subscription &&
    !subscription.id.startsWith("free_") &&
    subscription.status !== "free" &&
    plan.id !== "free";
  const periodEnd = subscription?.currentPeriodEnd
    ? dateFormatter.format(new Date(subscription.currentPeriodEnd))
    : null;
  const isScheduledCancel = Boolean(subscription?.cancelAtPeriodEnd);

  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Subscription</h2>
            <Badge variant={isPaid ? "secondary" : "outline"}>
              {plan.name}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {!isPaid
              ? "Your organization is on the Free plan. Upgrade from the sidebar anytime."
              : isScheduledCancel
                ? periodEnd
                  ? `Canceled — your ${plan.name} benefits remain active until ${periodEnd}.`
                  : `Canceled — your ${plan.name} benefits remain active until the current period ends.`
                : periodEnd
                  ? `Active ${plan.name} subscription. Next renewal on ${periodEnd}.`
                  : `Active ${plan.name} subscription.`}
          </p>
        </div>

        {isPaid && isAdmin && !isScheduledCancel ? (
          <div className="flex justify-end px-5 py-4 sm:px-6">
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              Cancel subscription
            </Button>
          </div>
        ) : null}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel subscription?"
        description={
          periodEnd
            ? `Your organization will keep full ${plan.name} benefits until ${periodEnd}, then return to the Free plan.`
            : `Your organization will keep full ${plan.name} benefits until the end of your current billing period, then return to the Free plan.`
        }
        confirmLabel="Cancel at period end"
        destructive
        isPending={cancelMutation.isPending}
        onConfirm={() =>
          void cancelMutation.mutateAsync({ organizationId: activeOrg.id })
        }
      />
    </>
  );
}
