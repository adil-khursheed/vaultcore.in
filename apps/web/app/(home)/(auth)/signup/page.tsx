import React, { Suspense } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import SectionContainer from "../../_components/section-container";
import SignUpForm from "./_components/signup-form";

const Page = () => {
  return (
    <SectionContainer className="flex">
      <div className="relative z-10 flex flex-1 items-center justify-center px-3">
        <Card className="bg-background/30 mx-auto w-full shadow-xl backdrop-blur-xs md:max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-2xl md:text-3xl">
              Create an account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg">
              Enter your credentials to create a new account
            </CardDescription>

            <p className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline">
                SignIn
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <Suspense
              fallback={<Loader2Icon className="size-6 animate-spin" />}
            >
              <SignUpForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
};

export default Page;
