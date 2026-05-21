"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { wrapVaultKeyForMember } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

export default function MembersList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { getVaultKey } = useVaultStore();
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const { data: pendingMembers, isLoading } = useQuery(
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

  const handleGrantAccess = async (member: any) => {
    try {
      if (!activeOrg?.id) return;

      if (member.publicKeyFingerprint) {
        const confirmed = window.confirm(
          `SECURITY CHECK\n\nPlease verify this fingerprint out-of-band with ${member.name} before granting access:\n\n${member.publicKeyFingerprint}\n\nDo you want to proceed?`,
        );
        if (!confirmed) return;
      }

      setGrantingId(member.id);

      const vaultKey = getVaultKey();
      if (!vaultKey) {
        toast.error("Your vault must be unlocked to grant access.");
        setGrantingId(null);
        return;
      }

      if (!member.publicKey) {
        toast.error("User does not have an active public key setup yet.");
        setGrantingId(null);
        return;
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
    } catch (error) {
      console.error("Access grant failed:", error);
      toast.error("An error occurred during key wrapping.");
      setGrantingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2Icon className="text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md border">
      <div className="p-6">
        <h3 className="text-lg leading-none font-medium">Pending Members</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          These members have joined the organization but do not have access to
          the vault yet. Click &quot;Grant Access&quot; to encrypt the vault key
          for them.
        </p>
      </div>
      <div className="divide-y">
        {pendingMembers?.pendingMembers?.length === 0 ? (
          <div className="text-muted-foreground p-6 text-center text-sm">
            No pending members
          </div>
        ) : (
          pendingMembers?.pendingMembers?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-6"
            >
              <div className="flex flex-col">
                <span className="font-medium">{member.name}</span>
                <span className="text-muted-foreground text-sm">
                  {member.email}
                </span>
                {member.publicKeyFingerprint ? (
                  <span className="bg-secondary text-secondary-foreground mt-1 inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-xs tracking-wider">
                    {member.publicKeyFingerprint}
                  </span>
                ) : (
                  <span className="mt-1 flex items-center text-xs text-yellow-600">
                    <ShieldAlertIcon className="mr-1 size-3" />
                    Legacy key - No fingerprint
                  </span>
                )}
              </div>

              <Button
                onClick={() => handleGrantAccess(member)}
                disabled={grantingId === member.id || !member.publicKey}
              >
                {grantingId === member.id ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <ShieldAlertIcon className="mr-2 size-4" />
                )}
                Grant Access
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
