import type { Metadata } from "next";
import React from "react";
import CreateOrgForm from "@/app/(root)/_components/create-org-form";
import LogoutButton from "@/app/(root)/[organization_slug]/_components/logout-button";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { getSession } from "@/lib/auth/server";
import { Building2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export const metadata: Metadata = {
  title: "Create organization",
  description: "Create a shared VaultCore workspace for your team.",
};

const Page = async () => {
  const session = await getSession();

  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-3 px-4 py-10">
        <BGPattern />
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
              <Building2Icon className="text-primary size-6" />
            </div>
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-2xl text-balance"
            >
              Create Organization
            </CardTitle>
            <CardDescription className="text-balance">
              Set up a shared workspace for your team&apos;s credentials. Your
              vault key is generated on this device.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CreateOrgForm variant="page" />
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground min-w-0 truncate text-xs">
              Signed in as {session?.user.email}
            </span>
            <LogoutButton />
          </CardFooter>
        </Card>
        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
