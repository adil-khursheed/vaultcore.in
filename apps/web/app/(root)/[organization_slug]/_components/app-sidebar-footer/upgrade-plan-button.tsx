"use client";

import React, { useMemo } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { plans } from "@/lib/utils/constants";
import NumberFlow from "@number-flow/react";
import { IconCheck } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";

import { placeholder } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { SidebarMenuItem } from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";

const UpgradePlanButton = () => {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.subscription.getPlan.queryOptions({
      organizationId: activeOrganization?.id,
    }),
  );

  const plansToUpgrade = useMemo(
    () =>
      plans.filter((plan) => plan.id !== data.plan.id && plan.id !== "free"),
    [data.plan],
  );

  const handlePlanCheckout = async (planId: string) => {
    try {
      await authClient.checkout({
        slug: planId,
        referenceId: activeOrganization?.id,
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to proceed with checkout.");
    }
  };

  return (
    <>
      {data.plan.id !== "family" && (
        <SidebarMenuItem>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full cursor-pointer" size={"sm"}>
                Upgrade your plan
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[95vh] w-full overflow-y-auto sm:max-w-4xl">
              <DialogHeader className="mb-6">
                <DialogTitle>Upgrade your plan</DialogTitle>
                <DialogDescription>
                  Choose a plan to upgrade your organization.
                </DialogDescription>
              </DialogHeader>

              <div className="flex w-full items-center justify-center gap-8">
                {plansToUpgrade.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={cn(
                      "bg-card border-border relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all",
                    )}
                  >
                    <div className="mb-8">
                      <h3 className="text-foreground text-2xl font-bold">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <div className="border-border mb-8 border-b pb-8">
                      <div className="flex items-baseline gap-1">
                        {typeof plan.price === "number" ? (
                          <NumberFlow
                            className="text-foreground font-medium"
                            format={{
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 2,
                            }}
                            suffix={`/year`}
                            value={plan.price}
                          />
                        ) : (
                          <span className="text-foreground font-medium">
                            {plan.price}.
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="mb-8 flex flex-1 flex-col gap-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full">
                            <IconCheck className="size-3" />
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      size={"lg"}
                      onClick={() => handlePlanCheckout(plan.id)}
                      className="w-full cursor-pointer"
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>
      )}
    </>
  );
};

export default UpgradePlanButton;
