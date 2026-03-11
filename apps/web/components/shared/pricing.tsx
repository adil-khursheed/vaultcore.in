"use client";

import React from "react";
import Link from "next/link";
import { useTRPC } from "@/lib/trpc/client";
import { plans } from "@/lib/utils/constants";
import NumberFlow from "@number-flow/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

const Pricing = () => {
  return (
    <div className="mt-8 grid w-full max-w-4xl gap-4 px-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card
          className={cn(
            "relative w-full scale-100 text-left lg:hover:scale-105 lg:hover:shadow-2xl lg:hover:transition-all lg:hover:duration-300",
            plan.isPopular && "ring-primary ring-2",
          )}
          key={plan.id}
        >
          {plan.isPopular && (
            <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full">
              Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
            <CardDescription>
              <p>{plan.description}</p>
              {typeof plan.yearlyPriceUsd === "number" ? (
                <NumberFlow
                  className="text-foreground font-medium"
                  format={{
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: Number.isInteger(plan.yearlyPriceUsd)
                      ? 0
                      : 2,
                    maximumFractionDigits: 2,
                  }}
                  suffix={`/year`}
                  value={plan.yearlyPriceUsd / 100}
                />
              ) : (
                <span className="text-foreground font-medium">
                  {plan.yearlyPriceUsd / 100}.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {plan.features &&
              plan.features.map((feature, index) => (
                <div
                  className="text-muted-foreground flex gap-2 text-sm"
                  key={index}
                >
                  <BadgeCheck className="h-lh w-4 flex-none" />
                  {feature}
                </div>
              ))}
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full"
              variant={plan.isPopular ? "default" : "secondary"}
            >
              <Link href={`/signup/${plan.id}`}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Pricing;
