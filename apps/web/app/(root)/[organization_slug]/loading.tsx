import React from "react";

import { Skeleton } from "@repo/ui/components/skeleton";

const Loading = () => {
  return (
    <div
      className="flex w-full flex-1 overflow-hidden"
      role="status"
      aria-label="Loading vault"
    >
      <div className="border-border flex w-full flex-col gap-3 border-r p-3 md:w-2/5">
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="size-9 shrink-0" />
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="border-border flex items-center gap-4 rounded-md border px-4 py-3"
            >
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-32 max-w-full" />
                <Skeleton className="h-3 w-20 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden flex-1 flex-col gap-6 p-4 md:flex">
        <div className="flex items-center gap-3 border-b pb-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default Loading;
