import React from "react";

import { Spinner } from "@repo/ui/components/spinner";

import SectionContainer from "./section-container";

const PageLoader = () => {
  return (
    <SectionContainer className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-12" />
    </SectionContainer>
  );
};

export default PageLoader;
