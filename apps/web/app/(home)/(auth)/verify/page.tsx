import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import SignUpForm from "./_components/signup-form";

export const dynamic = "force-dynamic";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const token = (await searchParams).token;

  if (!token) redirect("/pricing/personal");

  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-10">
        <BGPattern />

        <Card className="mx-auto w-full md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold md:text-2xl">
              Set up a strong password
            </CardTitle>
            <CardDescription className="text-center text-base">
              Finish creating your account by setting a password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense>
              <SignUpForm />
            </Suspense>
          </CardContent>
        </Card>

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
