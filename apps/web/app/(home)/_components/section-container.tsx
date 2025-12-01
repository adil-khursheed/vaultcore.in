import React from "react";

import { cn } from "@repo/ui/lib/utils";

const SectionContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "bg-background relative min-h-[calc(100dvh-60px)] w-full",
        className,
      )}
    >
      {children}
    </section>
  );
};

export default SectionContainer;
