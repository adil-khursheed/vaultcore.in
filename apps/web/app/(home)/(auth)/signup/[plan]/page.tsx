import React, { Suspense } from "react";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { Loader2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import NewAccountForm from "./_components/new-account-form";

const Page = async ({ params }: { params: Promise<{ plan: string }> }) => {
  const { plan } = await params;

  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-10">
        <BGPattern />

        <Card className="mx-auto w-full md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold md:text-2xl">
              Join VaultCore
            </CardTitle>
            <CardDescription className="text-center text-base">
              Secure your {plan} account with confidence
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={<Loader2Icon className="size-5 animate-spin" />}
            >
              <NewAccountForm />
            </Suspense>
          </CardContent>
        </Card>

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
