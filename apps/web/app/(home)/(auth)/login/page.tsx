import React, { Suspense } from "react";
import Link from "next/link";
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
    <SectionContainer className="flex">
      <div className="relative z-10 flex flex-1 items-center justify-center px-3">
        <Card className="bg-background/30 mx-auto w-full shadow-xl backdrop-blur-xs md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl md:text-3xl">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg">
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
      </div>
    </SectionContainer>
  );
};

export default Page;
