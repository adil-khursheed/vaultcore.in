import React, { Suspense } from "react";
import Link from "next/link";
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

import LoginForm from "./_components/login-form";

const Page = () => {
  return (
    <SectionContainer>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-10">
        <BGPattern />

        <Card className="mx-auto w-full md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold md:text-2xl">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to login to your account
            </CardDescription>

            <p className="text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary underline">
                SignUp
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={<Loader2Icon className="size-6 animate-spin" />}
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <BGPattern />
      </div>
    </SectionContainer>
  );
};

export default Page;
