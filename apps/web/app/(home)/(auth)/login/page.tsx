import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";

import LoginForm from "./_components/login-form";
import SectionContainer from "../_components/section-container";

const Page = () => {
  return (
    <SectionContainer>
      <div className="flex-1 flex items-center justify-center relative z-10 px-3">
        <Card className="md:max-w-lg mx-auto w-full bg-background/30 backdrop-blur-xs shadow-xl">
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
              fallback={<Loader2Icon className="animate-spin size-6" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default Page;
