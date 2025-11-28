import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import SignUpForm from "./_components/signup-form";

const Page = () => {
  return  <section className="min-h-[calc(100dvh-56px)] w-screen relative bg-background flex">
    <div className="flex-1 flex items-center justify-center relative z-10 px-3">
        <Card className="md:max-w-lg mx-auto w-full bg-background/30 backdrop-blur-xs shadow-xl">
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
              fallback={<Loader2Icon className="animate-spin size-6" />}>
              <SignUpForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </section>
};

export default Page;
