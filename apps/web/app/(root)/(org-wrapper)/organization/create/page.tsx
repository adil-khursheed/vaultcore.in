import React, { Suspense } from "react";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { Building2Icon, Loader2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

const Page = () => {
  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-3">
        <BGPattern />
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
              <Building2Icon className="text-primary size-6" />
            </div>
            <CardTitle className="text-2xl">Create Organization</CardTitle>
            <CardDescription>
              Enter your master password to access your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<Loader2Icon className="size-6 animate-spin" />}
            ></Suspense>
          </CardContent>
        </Card>

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
