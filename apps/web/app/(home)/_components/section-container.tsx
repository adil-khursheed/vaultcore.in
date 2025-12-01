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
        "bg-background text-foreground border_left border_right relative mx-auto min-h-[calc(100dvh-60px)] w-full max-w-6xl",
        className,
      )}
    >
      {children}
    </section>
  );
};

export default SectionContainer;
