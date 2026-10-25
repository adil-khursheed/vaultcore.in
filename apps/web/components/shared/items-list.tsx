"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EmptyList from "@/components/shared/empty-list";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { TCredential } from "@/lib/types/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, ChevronRight, Loader2 } from "lucide-react";

import { decryptString } from "@repo/crypto";
import { useCredentialStore, useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { SheetTrigger } from "@repo/ui/components/sheet";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

const CredentialRowSkeleton = () => {
  return (
    <div className="border-border bg-background flex shrink-0 items-center gap-4 rounded-md border px-4 py-3 shadow-xs">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-32 max-w-full" />
        <Skeleton className="h-3 w-20 max-w-full" />
      </div>
    </div>
  );
};

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
    let cancelled = false;

    const decrypt = async () => {
      try {
        const username = cred.username
          ? await decryptString(cred.username, vaultKey)
          : "";
        const url = cred.url
          ? await decryptString(cred.url, vaultKey)
          : undefined;

        if (!cancelled) {
          setDecrypted({ username, url });
        }
      } catch (error) {
        console.error("Failed to decrypt credential:", error);

        if (!cancelled) {
          setDecrypted({ username: "" });
        }
      }
    };

    void decrypt();

    return () => {
      cancelled = true;
    };
  }, [cred, vaultKey]);

  if (!decrypted) {
    return <CredentialRowSkeleton />;
  }

  return (
    <SheetTrigger asChild>
      <Button
        variant={"outline"}
        aria-current={selectedCredential?.id === cred.id ? "true" : undefined}
        className={cn(
          "relative h-auto w-full shrink-0 cursor-pointer justify-start overflow-hidden",
          selectedCredential?.id === cred.id &&
            "after:bg-primary after:absolute after:inset-y-0 after:left-0 after:w-1 after:content-['']",
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
                <Badge
                  variant="secondary"
                  className="border-border bg-muted text-muted-foreground text-[10px] capitalize"
                >
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

          <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
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

  const typeLabels = {
    login: "logins",
    card: "cards",
    identity: "identities",
    note: "notes",
    ssh_key: "SSH keys",
  } as const;

  const emptyCopy = search
    ? {
        title: `No results for “${search}”.`,
        subtitle: "Try a different name, username, or website.",
      }
    : isDeleted
      ? {
          title: "Trash is empty.",
          subtitle: "Items you delete will appear here.",
        }
      : isFavorite
        ? {
            title: "No favorites yet.",
            subtitle: "Star an item to find it here quickly.",
          }
        : type
          ? {
              title: `No ${typeLabels[type]} yet.`,
              subtitle: "Create a new item to get started.",
            }
          : {
              title: "No items found.",
              subtitle: "Create a new credential to get started.",
            };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      {isError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
          <AlertTriangleIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">Couldn&apos;t load your items</p>
            <p className="text-muted-foreground text-sm">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : isLoading ? (
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain"
          role="status"
          aria-label="Loading vault items"
        >
          {[...Array(10)].map((_, i) => (
            <CredentialRowSkeleton key={i} />
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <EmptyList title={emptyCopy.title} subtitle={emptyCopy.subtitle} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
          {credentials.map((cred) => (
            <DecryptedCredential
              key={cred.id}
              cred={cred}
              vaultKey={vaultKey!}
            />
          ))}

          <div ref={loadMoreRef} className="h-4 w-full shrink-0">
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
