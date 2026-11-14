import React from "react";

import SectionContainer from "@repo/site/components/section-container";
import { Spinner } from "@repo/ui/components/spinner";

const PageLoader = () => {
  return (
    <SectionContainer className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-12" />
    </SectionContainer>
  );
};

export default PageLoader;
