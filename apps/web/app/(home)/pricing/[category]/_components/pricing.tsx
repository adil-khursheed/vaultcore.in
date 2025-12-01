"use client";

import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";

const plans = [
  {
    id: "hobby",
    name: "Hobby",
    price: {
      monthly: "Free forever",
      yearly: "Free forever",
    },
    description:
      "The perfect starting place for your web app or personal project.",
    features: [
      "50 API calls / month",
      "60 second checks",
      "Single-user account",
      "5 monitors",
      "Basic email support",
    ],
    cta: "Get started for free",
  },
  {
    id: "pro",
    name: "Pro",
    price: {
      monthly: 90,
      yearly: 75,
    },
    description: "Everything you need to build and scale your business.",
    features: [
      "Unlimited API calls",
      "30 second checks",
      "Multi-user account",
      "10 monitors",
      "Priority email support",
    ],
    cta: "Subscribe to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: {
      monthly: "Get in touch for pricing",
      yearly: "Get in touch for pricing",
    },
    description: "Critical security, performance, observability and support.",
    features: [
      "You can DDOS our API.",
      "Nano-second checks.",
      "Invite your extended family.",
      "Unlimited monitors.",
      "We'll sit on your desk.",
    ],
    cta: "Contact us",
  },
];

const Pricing = () => {
  const [frequency, setFrequency] = useState<string>("monthly");
  return (
    <>
      <Tabs
        defaultValue={frequency}
        onValueChange={setFrequency}
        className="relative w-full items-center justify-center"
      >
        <div className="bg-border absolute top-1/2 left-1/2 h-px w-[200%] -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <TabsList className="relative z-10">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">
            Yearly
            <Badge variant="secondary">20% off</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-8 grid w-full max-w-4xl gap-4 px-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            className={cn(
              "relative w-full scale-100 text-left lg:hover:scale-105 lg:hover:shadow-2xl lg:hover:transition-all lg:hover:duration-300",
              plan.popular && "ring-primary ring-2",
            )}
            key={plan.id}
          >
            {plan.popular && (
              <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full">
                Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
              <CardDescription>
                <p>{plan.description}</p>
                {typeof plan.price[frequency as keyof typeof plan.price] ===
                "number" ? (
                  <NumberFlow
                    className="text-foreground font-medium"
                    format={{
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }}
                    suffix={`/month, billed ${frequency}.`}
                    value={
                      plan.price[frequency as keyof typeof plan.price] as number
                    }
                  />
                ) : (
                  <span className="text-foreground font-medium">
                    {plan.price[frequency as keyof typeof plan.price]}.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {plan.features.map((feature, index) => (
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
                className="w-full"
                variant={plan.popular ? "default" : "secondary"}
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Pricing;
