"use client";

import React, { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { authClient } from "@/lib/auth/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, KeyRoundIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { rotateVaultKey } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";

export default function VaultKeyRotation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { vaultKey, getPrivateKey } = useVaultStore();

  const [isRotating, setIsRotating] = useState(false);

  // Fetch active org ID by slug
  const { data: activeOrg } = authClient.useActiveOrganization();

  const rotateMutation = useMutation(
    trpc.vault.rotateVaultKey.mutationOptions()
  );

  const handleRotate = async () => {
    if (!activeOrg?.id) {
      toast.error("Organization not found.");
      return;
    }
    
    if (!vaultKey) {
      toast.error("Your vault is currently locked. Please unlock it to rotate keys.");
      return;
    }

    const privateKey = getPrivateKey();
    if (!privateKey) {
      toast.error("Private key not found. Please log out and back in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to rotate the organization's vault key? This will decrypt and re-encrypt all credentials and re-wrap the vault key for all active members. This process cannot be undone."
    );
    if (!confirmed) return;

    setIsRotating(true);
    try {
      // 1. Fetch all members
      const activeMembersRes = await queryClient.fetchQuery(
        trpc.vault.getActiveMembers.queryOptions({ organizationId: activeOrg.id })
      );
      
      const activeMembers = activeMembersRes.items.filter(
         // only rotate for active members with public keys
         (m: any) => m.vaultKeyStatus === "active" && m.publicKey
      ).map((m: any) => ({
         userId: m.userId,
         publicKeyJwk: JSON.parse(atob(m.publicKey!))
      }));

      // 2. Fetch all credentials
      // We need to fetch ALL without pagination limit to rotate properly
      // For a real production app, this would be done in batches
      const credentialsRes = await queryClient.fetchQuery(
        trpc.credential.getCredentials.queryOptions({
          organizationId: activeOrg.id,
          limit: 10000,
        })
      );

      // Fetch the current encrypted vault key for the user
      const currentVaultKeyRes = await queryClient.fetchQuery(
         trpc.vault.getMyVaultKey.queryOptions({ organizationId: activeOrg.id })
      );

      // 3. Perform rotation locally
      toast.info("Re-encrypting all data...");
      
      const { reEncryptedCredentials, newWrappedKeys, newVaultKey } = await rotateVaultKey({
        currentEncryptedVaultKey: currentVaultKeyRes.vaultKeyData.encryptedKey,
        userPrivateKey: privateKey,
        activeMembers,
        credentials: credentialsRes.items.map(c => ({
           id: c.id,
           type: c.type,
           username: c.username,
           password: c.password,
           url: c.url,
           otp: c.otp,
           note: c.note,
           data: c.data as Record<string, string> | null,
        }))
      });

      // 4. Send updates to server
      toast.info("Uploading rotated keys...");
      await rotateMutation.mutateAsync({
        organizationId: activeOrg.id,
        newMemberKeys: newWrappedKeys,
        reEncryptedCredentials,
      });

      // 5. Update local store
      useVaultStore.getState().setVaultKey(newVaultKey);

      toast.success("Vault key rotated successfully.");
    } catch (error: any) {
      console.error("Rotation failed:", error);
      toast.error(error.message || "Failed to rotate vault key.");
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCwIcon className="size-4" /> Rotate Vault Key
        </CardTitle>
        <CardDescription>
          Generate a new encryption key for your organization's vault. This process re-encrypts all credentials and re-wraps the new key for all active members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 text-destructive rounded-md border border-destructive/20 p-4 flex gap-3 text-sm">
          <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">Warning</p>
            <p>Rotating the vault key is a computationally expensive operation. Depending on the number of credentials and members in your organization, this may take several seconds. Please do not close the browser while rotation is in progress.</p>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={handleRotate} 
          disabled={isRotating}
        >
          {isRotating ? (
            <><Loader2Icon className="mr-2 size-4 animate-spin" /> Rotating...</>
          ) : (
            <><KeyRoundIcon className="mr-2 size-4" /> Rotate Organization Key</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
