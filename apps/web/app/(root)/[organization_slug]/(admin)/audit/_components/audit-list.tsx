"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { HistoryIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatAction = (action: string) =>
  action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatId = (id: string) => `${id.slice(0, 8)}…`;

export default function AuditList() {
  const trpc = useTRPC();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const { data, isLoading, isError, refetch } = useQuery(
    trpc.audit.getAuditLog.queryOptions(
      {
        organizationId: activeOrg?.id ?? "",
        limit: 50,
      },
      { enabled: !!activeOrg?.id },
    ),
  );

  const items = data?.items || [];

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <ShieldAlertIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Couldn&apos;t load the audit log
            </p>
            <p className="text-muted-foreground text-sm">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex w-full items-center justify-center p-8"
        role="status"
        aria-label="Loading audit log"
      >
        <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <HistoryIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Security events will appear here as your organization is used.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="divide-border divide-y">
        {items.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{formatAction(log.action)}</p>
              <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {log.actorUserId && (
                  <span>
                    Actor{" "}
                    <span
                      className="text-foreground/80 font-mono"
                      title={log.actorUserId}
                    >
                      {formatId(log.actorUserId)}
                    </span>
                  </span>
                )}
                {log.targetUserId && (
                  <span>
                    Target{" "}
                    <span
                      className="text-foreground/80 font-mono"
                      title={log.targetUserId}
                    >
                      {formatId(log.targetUserId)}
                    </span>
                  </span>
                )}
                {log.ipAddress && (
                  <span>
                    IP{" "}
                    <span className="text-foreground/80 font-mono">
                      {log.ipAddress}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <time
              dateTime={new Date(log.createdAt).toISOString()}
              className="text-muted-foreground shrink-0 text-xs whitespace-nowrap tabular-nums"
            >
              {dateFormatter.format(new Date(log.createdAt))}
            </time>
          </div>
        ))}
      </div>
    </Card>
  );
}
