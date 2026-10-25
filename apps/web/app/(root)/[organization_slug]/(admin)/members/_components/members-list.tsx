"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { wrapVaultKeyForMember } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

import ConfirmDialog from "../../../_components/confirm-dialog";

type PendingMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  publicKey?: string | null;
  publicKeyFingerprint?: string | null;
};

export default function MembersList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { getVaultKey } = useVaultStore();
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [memberToConfirm, setMemberToConfirm] = useState<PendingMember | null>(
    null,
  );

  const {
    data: pendingMembers,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    trpc.vault.getPendingMembers.queryOptions(
      { organizationId: activeOrg?.id ?? "" },
      { enabled: !!activeOrg?.id },
    ),
  );

  const grantAccess = useMutation(
    trpc.vault.grantVaultAccess.mutationOptions({
      onSuccess: () => {
        toast.success("Vault access granted to member");
        queryClient.invalidateQueries(
          trpc.vault.getPendingMembers.queryFilter({
            organizationId: activeOrg?.id ?? "",
          }),
        );
      },
      onError: (err) => {
        toast.error(err.message || "Failed to grant access");
      },
      onSettled: () => setGrantingId(null),
    }),
  );

  const grantVaultAccess = async (member: PendingMember) => {
    try {
      if (!activeOrg?.id) return false;

      setGrantingId(member.id);

      const vaultKey = getVaultKey();
      if (!vaultKey) {
        toast.error("Your vault must be unlocked to grant access.");
        return false;
      }

      if (!member.publicKey) {
        toast.error("This member has not set up a public key yet.");
        return false;
      }

      const publicKeyJwk = JSON.parse(atob(member.publicKey));
      const wrappedKeyBase64 = await wrapVaultKeyForMember(
        vaultKey,
        publicKeyJwk,
      );

      await grantAccess.mutateAsync({
        organizationId: activeOrg.id,
        userId: member.userId,
        encryptedKey: wrappedKeyBase64,
      });

      return true;
    } catch (error) {
      console.error("Access grant failed:", error);
      toast.error(
        "Couldn't grant vault access. Check your connection and try again.",
      );
      return false;
    } finally {
      setGrantingId(null);
    }
  };

  const handleGrantAccess = (member: PendingMember) => {
    if (!activeOrg?.id) return;

    if (member.publicKeyFingerprint) {
      setMemberToConfirm(member);
      return;
    }

    void grantVaultAccess(member);
  };

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <ShieldAlertIcon
          className="text-muted-foreground size-8"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Couldn&apos;t load members</p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex h-32 items-center justify-center"
        role="status"
        aria-label="Loading members"
      >
        <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold">Pending Members</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            These members have joined the organization but do not have access to
            the vault yet. Grant access to encrypt the vault key for them.
          </p>
        </div>
        <div className="divide-y">
          {pendingMembers?.pendingMembers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <UsersIcon
                className="text-muted-foreground size-8"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">No pending members</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Everyone who has joined already has access to the vault.
              </p>
            </div>
          ) : (
            pendingMembers?.pendingMembers?.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-muted-foreground truncate text-sm">
                    {member.email}
                  </span>
                  {member.publicKeyFingerprint ? (
                    <Badge
                      variant="secondary"
                      className="border-border bg-muted text-muted-foreground mt-2 w-fit font-mono text-xs tracking-wider"
                    >
                      {member.publicKeyFingerprint}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground mt-2 flex items-center text-xs">
                      <ShieldAlertIcon
                        className="mr-1 size-3"
                        aria-hidden="true"
                      />
                      Legacy key, no fingerprint
                    </span>
                  )}
                </div>

                <Button
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => handleGrantAccess(member)}
                  disabled={grantingId === member.id || !member.publicKey}
                >
                  {grantingId === member.id ? (
                    <Loader2Icon
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldCheckIcon
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                  )}
                  Grant Access
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={!!memberToConfirm}
        onOpenChange={(open) => {
          if (!open) setMemberToConfirm(null);
        }}
        title="Verify member identity"
        description="Confirm this fingerprint out-of-band with the member before granting vault access."
        details={
          memberToConfirm?.publicKeyFingerprint ? (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Fingerprint
              </p>
              <code className="text-foreground mt-1 block font-mono text-xs tracking-wider break-all">
                {memberToConfirm.publicKeyFingerprint}
              </code>
            </div>
          ) : null
        }
        confirmLabel="Grant access"
        isPending={grantingId === memberToConfirm?.id}
        onConfirm={async () => {
          if (!memberToConfirm) return;

          const granted = await grantVaultAccess(memberToConfirm);
          if (granted) setMemberToConfirm(null);
        }}
      />
    </>
  );
}
