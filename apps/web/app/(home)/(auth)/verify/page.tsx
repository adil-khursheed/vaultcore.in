import type { Metadata } from "next";
import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@repo/ui/components/card";

import SignUpForm from "./_components/signup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set your master password",
  description:
    "Finish creating your VaultCore account by choosing a master password. It encrypts your vault locally and is never sent to our servers.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const token = (await searchParams).token;

  if (!token) redirect("/pricing/personal");

  return (
    <SectionContainer>
      <div className="relative flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center px-4 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <BGPattern />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <BGPattern />
        </div>

        <Card className="bg-card border-border relative z-20 mx-auto w-full shadow-sm md:max-w-md">
          <CardHeader className="gap-2">
            <h1 className="text-foreground text-xl font-semibold md:text-2xl">
              Set your master password
            </h1>
            <CardDescription className="text-base leading-relaxed">
              This one password encrypts your entire vault. It never leaves this
              device.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Choose carefully. Because we never store your master password,
                we can&apos;t reset or recover it for you.
              </p>
            </div>

            <Suspense>
              <SignUpForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default Page;
