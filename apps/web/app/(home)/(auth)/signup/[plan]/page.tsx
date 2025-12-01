import React, { Suspense } from "react";
import { Loader2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import SectionContainer from "../../../_components/section-container";
import NewAccountForm from "./_components/new-account-form";

const Page = async ({ params }: { params: Promise<{ plan: string }> }) => {
  const { plan } = await params;

  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-10">
        <div className="bg_pattern border_top border_bottom relative h-20 w-full" />

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

        <div className="bg_pattern border_top border_bottom relative h-20 w-full" />
      </div>
    </SectionContainer>
  );
};

export default Page;
