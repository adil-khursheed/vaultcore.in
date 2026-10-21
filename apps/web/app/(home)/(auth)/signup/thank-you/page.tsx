import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@repo/ui/components/card";

export const metadata: Metadata = {
  title: "Check your inbox",
  description:
    "We sent a verification link to your email. Open it to finish creating your VaultCore account.",
  robots: {
    index: false,
    follow: false,
  },
};

const steps = [
  "Open the email from VaultCore.",
  "Click the verification link.",
  "Choose the master password that encrypts your vault.",
];

const ThankYouPage = () => {
  return (
    <SectionContainer>
      <div className="relative flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <BGPattern />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <BGPattern />
        </div>

        <Card className="bg-card relative mx-auto w-full overflow-hidden py-0 shadow-sm md:max-w-3xl">
          <div className="grid md:grid-cols-2">
            <div className="bg-muted/30 relative h-56 md:h-full">
              <Image
                src="/images/thank-you-illustration.png"
                alt="VaultCore welcome illustration"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col justify-center">
              <CardHeader className="gap-2 pt-8 md:pt-10">
                <h1 className="text-foreground text-2xl font-bold md:text-3xl">
                  Check your inbox
                </h1>
                <CardDescription className="text-base leading-relaxed">
                  We sent a verification link to the email you entered. Open it
                  to finish setting up your vault.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-6 pt-5 pb-10">
                <ol className="flex flex-col gap-3">
                  {steps.map((step, index) => (
                    <li
                      key={step}
                      className="text-muted-foreground flex items-start gap-3 text-sm"
                    >
                      <span className="border-border bg-muted/60 text-foreground flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <Link href="/">Back to home</Link>
                  </Button>
                  <p className="text-muted-foreground text-center text-xs text-pretty">
                    It may take a minute. Check your spam folder if it
                    doesn&apos;t arrive.
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default ThankYouPage;
