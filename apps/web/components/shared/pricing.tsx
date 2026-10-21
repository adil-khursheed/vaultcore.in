"use client";

import React from "react";
import Link from "next/link";
import { plans } from "@/lib/utils/constants";
import NumberFlow from "@number-flow/react";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

const Pricing = () => {
  return (
    <div className="grid w-full max-w-4xl gap-4 px-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <article
          key={plan.id}
          aria-labelledby={`plan-${plan.id}`}
          className={cn(
            "group bg-card relative flex flex-col rounded-xl border p-6 shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-xl motion-safe:hover:-translate-y-1",
            plan.isPopular ? "border-mint/60 ring-mint ring-2" : "",
          )}
        >
          {plan.isPopular && (
            <Badge className="bg-mint text-mint-ink absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full">
              Most popular
            </Badge>
          )}

          <div className="flex flex-col gap-2">
            <h3
              id={`plan-${plan.id}`}
              className="text-foreground text-lg font-semibold"
            >
              {plan.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {plan.description}
            </p>
          </div>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-foreground text-3xl font-semibold tracking-tight">
              <NumberFlow
                format={{
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }}
                value={plan.yearlyPriceUsd / 100}
              />
            </span>
            <span className="text-muted-foreground text-sm">/year</span>
          </div>

          <ul className="border-border mt-6 flex flex-1 flex-col gap-3 border-t pt-6">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="text-muted-foreground flex items-start gap-2.5 text-sm"
              >
                <IconCheck className="text-mint mt-0.5 size-4 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            className="group/cta mt-6 w-full"
            variant={plan.isPopular ? "default" : "outline"}
          >
            <Link href={`/signup/${plan.id}`}>
              {plan.cta}
              <IconArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" />
            </Link>
          </Button>
        </article>
      ))}
    </div>
  );
};

export default Pricing;
