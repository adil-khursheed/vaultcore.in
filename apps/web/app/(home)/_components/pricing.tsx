"use client";

import React from "react";
import Link from "next/link";
import SectionContainer from "@/components/shared/section-container";
import { IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Essential security for individuals.",
    features: [
      "Unlimited passwords",
      "1 Device type",
      "Auto-fill & Auto-save",
      "Secure Note Storage",
    ],
    cta: "Get Started",
    popular: false,
    href: "/register",
  },
  {
    name: "Pro",
    price: "$3",
    period: "/month",
    description: "Advanced protection for power users.",
    features: [
      "Everything in Free",
      "Unlimited Devices",
      "1GB Encrypted File Storage",
      "Priority Support",
      "Dark Web Monitoring",
    ],
    cta: "Start Free Trial",
    popular: true,
    href: "/register?plan=pro",
  },
  {
    name: "Team",
    price: "$5",
    period: "/user/month",
    description: "Secure collaboration for your business.",
    features: [
      "Everything in Pro",
      "Admin Dashboard",
      "User Management",
      "Shared Vaults",
      "Activity Logs",
    ],
    cta: "Contact Sales",
    popular: false,
    href: "/contact",
  },
];

const PricingSection = () => {
  return (
    <SectionContainer className="min-h-auto py-24">
      <div className="border_bottom flex flex-col items-center gap-16 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-foreground text-3xl font-bold md:text-5xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Choose the plan that fits your security needs. No hidden fees.
            Cancel anytime.
          </p>
        </div>

        <div className="grid w-full gap-8 md:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={cn(
                "bg-card relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all",
                plan.popular
                  ? "border-primary/50 shadow-primary/10 shadow-lg"
                  : "border-border",
              )}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

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
                  <span className="text-foreground text-4xl font-bold">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
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
                asChild
                size={"lg"}
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
};

export default PricingSection;
