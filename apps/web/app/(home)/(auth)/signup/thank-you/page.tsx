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
  CardTitle,
} from "@repo/ui/components/card";

const ThankYouPage = () => {
  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-10">
        <BGPattern />

        <Card className="mx-auto w-full overflow-hidden py-0 md:max-w-4xl">
          <div className="grid md:grid-cols-2">
            <div className="bg-muted/30 relative h-64 md:h-full">
              <Image
                src="/images/thank-you-illustration.png"
                alt="Welcome to VaultCore"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <CardHeader className="pt-8 text-center md:pt-10 md:text-left">
                <CardTitle className="text-2xl font-bold md:text-3xl">
                  Welcome to VaultCore! 🎉
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Thank you for joining us. We're excited to help you secure
                  your digital life.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-5 pb-10">
                <div className="bg-primary/5 border-primary/10 rounded-lg border p-4">
                  <p className="text-muted-foreground text-center text-sm leading-relaxed md:text-left">
                    We've sent a <strong>verification email</strong> to your
                    inbox. Please click the link in the email to verify your
                    account and get started.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <Link href="/">Go to Home Page</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default ThankYouPage;
