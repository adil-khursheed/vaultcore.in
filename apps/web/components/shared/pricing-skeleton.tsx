import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

const PricingSkeleton = () => {
  return (
    <div className="mt-8 grid w-full max-w-4xl gap-4 px-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </CardHeader>

          <CardContent className="grid gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full max-w-3/4 rounded-full" />
            ))}
          </CardContent>

          <CardFooter>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PricingSkeleton;
