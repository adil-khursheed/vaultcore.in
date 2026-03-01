"use client";

import React from "react";
import EmptyList from "@/components/shared/empty-list";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { decryptString } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import { useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

const DecryptedCredential = ({
  cred,
  vaultKey,
}: {
  cred: any;
  vaultKey: CryptoKey;
}) => {
  const [decrypted, setDecrypted] = React.useState<{
    username: string;
    url?: string;
  } | null>(null);

  React.useEffect(() => {
    const decrypt = async () => {
      const username = await decryptString(cred.username, vaultKey);
      const url = cred.url
        ? await decryptString(cred.url, vaultKey)
        : undefined;
      setDecrypted({ username, url });
    };
    decrypt();
  }, [cred, vaultKey]);

  if (!decrypted) {
    return (
      <Card className="hover:bg-accent/50 transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant={"outline"}
      className="h-auto w-full cursor-pointer justify-start"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar>
            <AvatarImage
              src={`https://www.google.com/s2/favicons?domain=${decrypted.url}&sz=64`}
            />
            <AvatarFallback>{cred.title[0]}</AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-y-1 text-left">
            <p className="truncate font-medium">{cred.title}</p>
            <p className="text-muted-foreground truncate text-xs">
              {decrypted.username}
            </p>
          </div>
        </div>

        <ChevronRight className="size-4" />
      </div>
    </Button>
  );
};

const AllItemsList = () => {
  const trpc = useTRPC();
  const { isLocked, vaultKey } = useVaultStore();
  const { data: session } = authClient.useSession();

  const { data: credentials, isLoading } = useQuery({
    ...trpc.credential.getAll.queryOptions({
      organizationId: session?.session.activeOrganizationId!,
    }),
    enabled: !isLocked && !!session?.session.activeOrganizationId,
  });

  if (isLocked) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-y-auto p-3">
      {!credentials || credentials.length === 0 ? (
        <div className="flex min-h-[calc(100vh-50px)] w-full flex-col items-center justify-center">
          <EmptyList
            title="No items found."
            subtitle="Create a new credential to get started."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {credentials.map((cred) => (
            <DecryptedCredential
              key={cred.id}
              cred={cred}
              vaultKey={vaultKey!}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllItemsList;
