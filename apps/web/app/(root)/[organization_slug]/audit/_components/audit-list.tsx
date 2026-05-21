"use client";

import React from "react";
import { useTRPC } from "@/lib/trpc/client";
import { authClient } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";

import { Card, CardContent } from "@repo/ui/components/card";

export default function AuditList() {
  const trpc = useTRPC();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const { data, isLoading } = useQuery(
    trpc.audit.getAuditLog.queryOptions(
      {
        organizationId: activeOrg?.id!,
        limit: 50,
      },
      { enabled: !!activeOrg?.id },
    ),
  );

  const items = data?.items || [];

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ShieldAlertIcon className="mb-4 size-12 opacity-20" />
          <p>No audit logs found for this organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="divide-y divide-border">
          {items.map((log: any) => (
            <div
              key={log.id}
              className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {log.action
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {log.actorUserId && <span>Actor: {log.actorUserId}</span>}
                  {log.targetUserId && <span>Target: {log.targetUserId}</span>}
                  {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground sm:mt-0 sm:text-right">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(log.createdAt))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
