import React from "react";
import Link from "next/link";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";

import { Button } from "@repo/ui/components/button";

const NotFound = () => {
  return (
    <SectionContainer className="flex min-h-dvh flex-col items-center justify-center">
      <BGPattern />
      <div className="flex-col items-center justify-center py-10 text-center">
        <h1 className="text-9xl font-extrabold tracking-tight">404</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Oops! The page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/">Go back to Home</Link>
          </Button>
        </div>
      </div>
      <BGPattern />
    </SectionContainer>
  );
};

export default NotFound;
