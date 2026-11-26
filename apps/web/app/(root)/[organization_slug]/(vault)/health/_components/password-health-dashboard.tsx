"use client";

import React, { useMemo, useState } from "react";
import { useEntitlement } from "@/hooks/use-entitlement";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { RouterOutputs } from "@repo/api";
import {
  analyzePasswordHealth,
  calculatePasswordStrength,
  decryptStringOrPlaintext,
  encryptString,
  OLD_PASSWORD_DAYS,
  type PasswordHealthFinding,
} from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

type FilterTab = "all" | "weak" | "reused" | "old";

async function safeDecrypt(
  value: string | null | undefined,
  vaultKey: CryptoKey,
): Promise<string> {
  if (!value) return "";
  try {
    return await decryptStringOrPlaintext(value, vaultKey);
  } catch {
    return "";
  }
}

function generateStrongPassword(length = 20): string {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_";
  const random = new Uint32Array(length);
  crypto.getRandomValues(random);
  return Array.from(random, (n) => chars[n % chars.length]).join("");
}

export default function PasswordHealthDashboard() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [editingItem, setEditingItem] =
    useState<PasswordHealthFinding | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { vaultKey } = useVaultStore();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const organizationId = activeOrg?.id ?? "";

  const { allowed: isEntitled, isLoading: isPlanLoading } = useEntitlement(
    "healthReports",
    organizationId,
  );

  const healthQuery = useQuery({
    queryKey: ["password-health", organizationId],
    enabled: !!organizationId && !!vaultKey && isEntitled,
    queryFn: async () => {
      if (!vaultKey) throw new Error("Vault is locked");

      const allItems: RouterOutputs["credential"]["getCredentials"]["items"] =
        [];
      let cursor: string | undefined = undefined;

      do {
        const page: RouterOutputs["credential"]["getCredentials"] =
          await queryClient.fetchQuery(
            trpc.credential.getCredentials.queryOptions({
              organizationId,
              type: "login",
              isDeleted: false,
              limit: 100,
              cursor,
            }),
          );
        allItems.push(...page.items);
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      const decrypted = await Promise.all(
        allItems.map(async (item) => ({
          id: item.id,
          title: (await safeDecrypt(item.title, vaultKey)) || "Untitled",
          username: (await safeDecrypt(item.username, vaultKey)) || null,
          url: (await safeDecrypt(item.url, vaultKey)) || null,
          password: await safeDecrypt(item.password, vaultKey),
          updatedAt: item.updatedAt,
        })),
      );

      return analyzePasswordHealth(decrypted);
    },
  });

  const updateMutation = useMutation(
    trpc.credential.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Password updated");
        setEditingItem(null);
        setNewPassword("");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["password-health", organizationId],
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.credential.getCredentials.pathKey(),
          }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update password");
      },
    }),
  );

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !vaultKey || !organizationId || !newPassword) return;
    const encryptedPassword = await encryptString(newPassword, vaultKey);
    await updateMutation.mutateAsync({
      id: editingItem.id,
      organizationId,
      password: encryptedPassword,
    });
  };

  const report = healthQuery.data;
  const filteredFindings = useMemo(() => {
    if (!report) return [];
    if (activeTab === "weak") return report.findings.filter((f) => f.isWeak);
    if (activeTab === "reused")
      return report.findings.filter((f) => f.isReused);
    if (activeTab === "old") return report.findings.filter((f) => f.isOld);
    return report.findings;
  }, [report, activeTab]);

  const newStrength = calculatePasswordStrength(newPassword);

  if (isPlanLoading) {
    return (
      <div className="flex h-48 items-center justify-center" role="status">
        <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (!isEntitled) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Password Health
          </h1>
          <p className="text-muted-foreground text-sm">
            Spot weak, reused, and outdated passwords across your vault.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <LockIcon
              className="text-muted-foreground size-8"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Password Health requires Premium or Family
              </p>
              <p className="text-muted-foreground max-w-md text-sm">
                Upgrade your organization from the sidebar to run local,
                zero-knowledge password health checks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Password Health
            </h1>
            <p className="text-muted-foreground text-sm">
              Analyzed locally on your device across {report?.totalLogins ?? 0}{" "}
              saved logins.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void healthQuery.refetch()}
            disabled={healthQuery.isFetching}
          >
            <RefreshCwIcon
              className={
                healthQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
              aria-hidden="true"
            />
            Re-scan
          </Button>
        </div>

        {healthQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center" role="status">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : healthQuery.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <AlertTriangleIcon
                className="text-muted-foreground size-8"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                Couldn&apos;t analyze password health
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void healthQuery.refetch()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : report ? (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-xs font-medium">
                    Health score
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {report.score}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-xs font-medium">
                    Weak
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {report.weakCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-xs font-medium">
                    Reused
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {report.reusedCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-xs font-medium">
                    Old (&gt;{OLD_PASSWORD_DAYS}d)
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {report.oldCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", `All issues (${report.findings.length})`],
                  ["weak", `Weak (${report.weakCount})`],
                  ["reused", `Reused (${report.reusedCount})`],
                  ["old", `Old (${report.oldCount})`],
                ] as const
              ).map(([tab, label]) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {filteredFindings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  {report.findings.length === 0 ? (
                    <CheckCircle2Icon
                      className="text-primary size-8"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldCheckIcon
                      className="text-muted-foreground size-8"
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-sm font-medium">
                    {report.findings.length === 0
                      ? "All saved passwords look healthy"
                      : "No items in this category"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {report.findings.length === 0
                      ? "No weak, reused, or outdated passwords were found."
                      : "Switch tabs above to inspect other findings."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="gap-0 overflow-hidden py-0">
                <div className="divide-border divide-y">
                  {filteredFindings.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                        {item.username && (
                          <p className="text-muted-foreground truncate text-xs">
                            {item.username}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.isWeak && (
                            <Badge variant="destructive">
                              Weak ({item.strength.level})
                            </Badge>
                          )}
                          {item.isReused && (
                            <Badge variant="secondary">
                              Reused ({item.reuseCount}x)
                            </Badge>
                          )}
                          {item.isOld && (
                            <Badge variant="outline">
                              {item.ageDays}d old
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => {
                          setEditingItem(item);
                          setNewPassword("");
                        }}
                      >
                        <KeyRoundIcon className="size-4" aria-hidden="true" />
                        Update password
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : null}
      </div>

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update password</DialogTitle>
            <DialogDescription>
              Set a stronger password for{" "}
              <strong className="text-foreground">{editingItem?.title}</strong>.
              Remember to update it on the website as well.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleSavePassword(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="health-new-password">New password</Label>
              <div className="flex gap-2">
                <Input
                  id="health-new-password"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter or generate a strong password"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewPassword(generateStrongPassword())}
                >
                  Generate
                </Button>
              </div>
              {newPassword && (
                <p className="text-muted-foreground text-xs">
                  Strength:{" "}
                  <span className="text-foreground font-medium capitalize">
                    {newStrength.level}
                  </span>{" "}
                  ({newStrength.score}/100)
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newPassword || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving…" : "Save password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
