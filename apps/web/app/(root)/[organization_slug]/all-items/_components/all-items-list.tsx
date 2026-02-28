"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { useVaultStore } from "@repo/store";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

const AllItemsList = () => {
  const trpc = useTRPC();
  const { isLocked } = useVaultStore();
  const { data: session } = authClient.useSession();

  const { data: credentials, isLoading } = useQuery({
    ...trpc.credential.getAll.queryOptions({
      organizationId: session?.session.activeOrganizationId!,
    }),
    enabled: !isLocked && !!session?.session.activeOrganizationId, // Only fetch if unlocked
  });

  if (isLocked) {
    return null; // Redirecting...
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-full px-3">
      {!credentials || credentials.length === 0 ? (
        <div className="text-muted-foreground flex min-h-[calc(100vh-50px)] w-full flex-col items-center justify-center">
          <p>No items found.</p>
          <p className="text-sm">Create a new credential to get started.</p>
        </div>
      ) : (
        <>
          <div>
            {credentials.map((cred) => (
              <Card key={cred.id} className="hover:bg-accent/50 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="overflow-hidden text-lg font-bold text-ellipsis whitespace-nowrap">
                    {cred.title}
                  </CardTitle>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    Credential
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-sm font-medium">
                      Username
                    </div>
                    <div className="truncate text-sm">{cred.username}</div>
                  </div>
                  {cred.url && (
                    <div className="mt-2 grid gap-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        URL
                      </div>
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary truncate text-sm hover:underline"
                      >
                        {cred.url}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllItemsList;
