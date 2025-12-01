import React from "react";
import Link from "next/link";
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
import { cn } from "@repo/ui/lib/utils";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "Free forever",
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
    id: "premium",
    name: "Premium",
    price: 10,
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
    id: "families",
    name: "Families",
    price: 40,
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
  return (
    <>
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
                {typeof plan.price === "number" ? (
                  <NumberFlow
                    className="text-foreground font-medium"
                    format={{
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }}
                    suffix={`/year`}
                    value={plan.price}
                  />
                ) : (
                  <span className="text-foreground font-medium">
                    {plan.price}.
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
                asChild
                className="w-full"
                variant={plan.popular ? "default" : "secondary"}
              >
                <Link href={`/signup/${plan.id}`}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Pricing;
