import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/(root)/[organization_slug]/_components/logout-button";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { getSession } from "@/lib/auth/server";
import { Loader2Icon, LockIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import LockForm from "./_components/lock-form";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-3">
        <BGPattern />
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
              <LockIcon className="text-primary size-6" />
            </div>
            <CardTitle className="text-2xl">Unlock Vault</CardTitle>
            <CardDescription>
              Enter your master password to access your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<Loader2Icon className="size-6 animate-spin" />}
            >
              <LockForm user={user} />
            </Suspense>
          </CardContent>
        </Card>

        <LogoutButton />

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
