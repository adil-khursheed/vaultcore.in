import type { Metadata } from "next";
import React, { Suspense } from "react";
import Link from "next/link";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { Loader2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";

import LoginForm from "./_components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your VaultCore vault. Your master password decrypts your vault locally and is never sent to our servers.",
  robots: {
    index: false,
    follow: true,
  },
};

const Page = () => {
  return (
    <SectionContainer>
      <div className="relative flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <BGPattern />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <BGPattern />
        </div>

        <Card className="bg-card border-border relative mx-auto w-full shadow-sm md:max-w-md">
          <CardHeader className="gap-2">
            <h1 className="text-foreground text-xl font-semibold md:text-2xl">
              Welcome back
            </h1>
            <CardDescription className="text-base leading-relaxed">
              Log in to your vault. Your master password is never sent to our
              servers.
            </CardDescription>

            <p className="text-muted-foreground mt-2 text-sm">
              New to VaultCore?{" "}
              <Link
                href="/pricing/personal"
                className="text-foreground decoration-border hover:decoration-foreground underline underline-offset-4 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={
                <div className="flex justify-center py-6">
                  <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>

          <CardFooter>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your master password decrypts your vault on this device. Because
              we never store it, we can&apos;t reset it for you.
            </p>
          </CardFooter>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default Page;
