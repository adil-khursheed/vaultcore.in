"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { HistoryIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatId = (id: string) => `${id.slice(0, 8)}…`;

export default function AuditLogs() {
  const trpc = useTRPC();

  const { data: activeOrg } = authClient.useActiveOrganization();

  const {
    data: rotationLogs,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    trpc.vault.getRotationLogs.queryOptions(
      {
        organizationId: activeOrg?.id || "",
      },
      { enabled: !!activeOrg?.id },
    ),
  );
  // Note: if the endpoint isn't implemented, we fallback gracefully

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HistoryIcon className="size-4" aria-hidden="true" /> Rotation Audit
          Log
        </CardTitle>
        <CardDescription>
          History of all vault key rotation events for this organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <ShieldAlertIcon
              className="text-muted-foreground size-6"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm">
              Couldn&apos;t load rotation history.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div
            className="flex justify-center py-4"
            role="status"
            aria-label="Loading rotation history"
          >
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {rotationLogs?.logs?.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No rotation events yet.
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {rotationLogs?.logs?.map((log) => (
                  <div key={log.id} className="flex flex-col gap-1 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Version {log.previousVersion} → {log.newVersion}
                      </span>
                      <time
                        dateTime={new Date(log.createdAt).toISOString()}
                        className="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
                      >
                        {dateFormatter.format(new Date(log.createdAt))}
                      </time>
                    </div>
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>
                        Initiated by:{" "}
                        <span className="font-mono" title={log.initiatedBy}>
                          {formatId(log.initiatedBy)}
                        </span>
                      </span>
                      <span className="tabular-nums">
                        Members rotated: {log.membersRotated}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
