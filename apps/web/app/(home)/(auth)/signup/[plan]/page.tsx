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

import NewAccountForm from "./_components/new-account-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a VaultCore account and start with a private, zero-knowledge vault for your passwords, cards, notes, and keys.",
  robots: {
    index: false,
    follow: true,
  },
};

const Page = async ({ params }: { params: Promise<{ plan: string }> }) => {
  const { plan } = await params;
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

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
              Create your {planName.toLowerCase()} account
            </h1>
            <CardDescription className="text-base leading-relaxed">
              One private place for every password, card, note, and key you want
              to keep.
            </CardDescription>

            <p className="text-muted-foreground mt-2 text-sm">
              Already have a vault?{" "}
              <Link
                href="/login"
                className="text-foreground decoration-border hover:decoration-foreground underline underline-offset-4 transition-colors"
              >
                Log in
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={
                <div className="flex justify-center py-6">
                  <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
                </div>
              }
            >
              <NewAccountForm />
            </Suspense>
          </CardContent>

          <CardFooter>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We&apos;ll email you a verification link. No password is created
              until you click it.
            </p>
          </CardFooter>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default Page;
