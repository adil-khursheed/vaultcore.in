"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export default function AuditLogs() {
  const trpc = useTRPC();

  const { data: activeOrg } = authClient.useActiveOrganization();

  const { data: rotationLogs, isLoading } = useQuery(
    trpc.vault.getRotationLogs.queryOptions(
      {
        organizationId: activeOrg?.id || "",
      },
      { enabled: !!activeOrg?.id },
    ),
  );
  // Note: if the endpoint isn't implemented, we fallback gracefully

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlertIcon className="size-4" /> Rotation Audit Log
        </CardTitle>
        <CardDescription>
          History of all vault key rotation events for this organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {rotationLogs?.logs?.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No rotation events found.
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {rotationLogs?.logs?.map((log: any) => (
                  <div key={log.id} className="flex flex-col gap-1 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Version {log.previousVersion} → {log.newVersion}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(log.createdAt))}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Initiated by: {log.initiatedBy}</span>
                      <span>Members rotated: {log.membersRotated}</span>
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
