"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EmptyList from "@/components/shared/empty-list";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { TCredential } from "@/lib/types/types";
import { decryptString } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";

import { useCredentialStore, useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { SheetTrigger } from "@repo/ui/components/sheet";
import { useSidebar } from "@repo/ui/components/sidebar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

const DecryptedCredential = ({
  cred,
  vaultKey,
}: {
  cred: TCredential;
  vaultKey: CryptoKey;
}) => {
  const [decrypted, setDecrypted] = React.useState<{
    username: string;
    url?: string;
  } | null>(null);

  const { setSelectedCredential, selectedCredential } = useCredentialStore();

  React.useEffect(() => {
    const decrypt = async () => {
      try {
        const username = cred.username
          ? await decryptString(cred.username, vaultKey)
          : "";
        const url = cred.url
          ? await decryptString(cred.url, vaultKey)
          : undefined;
        setDecrypted({ username, url });
      } catch (error) {
        console.error("Failed to decrypt credential:", error);
      }
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
    <SheetTrigger asChild>
      <Button
        variant={"outline"}
        className={cn(
          "h-auto w-full cursor-pointer justify-start",
          selectedCredential?.id === cred.id &&
            "border-primary dark:border-primary border-l-4",
        )}
        onClick={() => {
          setSelectedCredential(null);
          setSelectedCredential(cred);
        }}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Avatar>
              <AvatarImage
                src={
                  cred.type === "login" && decrypted?.url
                    ? `https://www.google.com/s2/favicons?domain=${decrypted?.url}&sz=64`
                    : undefined
                }
              />
              <AvatarFallback className="text-sm font-medium capitalize">
                {cred.title[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-y-1 text-left">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{cred.title}</p>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {cred.type.replace("_", " ")}
                </Badge>
              </div>
              {decrypted?.username && (
                <p className="text-muted-foreground truncate text-xs">
                  {decrypted?.username}
                </p>
              )}
            </div>
          </div>

          <ChevronRight className="size-4" />
        </div>
      </Button>
    </SheetTrigger>
  );
};

const ItemsList = ({
  type,
  isFavorite,
  isDeleted = false,
}: {
  type?: "login" | "card" | "identity" | "note" | "ssh_key";
  isFavorite?: boolean;
  isDeleted?: boolean;
}) => {
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const trpc = useTRPC();

  const { isLocked, vaultKey } = useVaultStore();

  const { data: session } = authClient.useSession();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...trpc.credential.getCredentials.infiniteQueryOptions({
        organizationId: session?.session.activeOrganizationId as string,
        limit: 20,
        type,
        isFavorite,
        isDeleted,
        search,
      }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !isLocked && !!session?.session.activeOrganizationId,
    });

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries &&
          entries[0] &&
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLocked) {
    return null;
  }

  const credentials = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      {isLoading ? (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {[...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              className="bg-background dark:bg-input/30 dark:border-input w-full rounded-md border px-4 py-3 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <EmptyList
            title="No items found."
            subtitle="Create a new credential to get started."
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {credentials.map((cred) => (
            <DecryptedCredential
              key={cred.id}
              cred={cred}
              vaultKey={vaultKey!}
            />
          ))}

          <div ref={loadMoreRef} className="h-4 w-full">
            {isFetchingNextPage && (
              <div className="flex justify-center p-2">
                <Loader2 className="text-primary size-4 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
