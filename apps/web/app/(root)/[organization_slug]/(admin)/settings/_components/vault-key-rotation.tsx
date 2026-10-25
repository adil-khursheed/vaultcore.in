"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  KeyRoundIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";
import { toast } from "sonner";

import { rotateVaultKey } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import ConfirmDialog from "../../../_components/confirm-dialog";

export default function VaultKeyRotation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { vaultKey, getPrivateKey } = useVaultStore();

  const [isRotating, setIsRotating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: activeOrg } = authClient.useActiveOrganization();

  const rotateMutation = useMutation(
    trpc.vault.rotateVaultKey.mutationOptions(),
  );

  const handleRotate = () => {
    if (!activeOrg?.id) {
      toast.error("Organization not found.");
      return;
    }

    if (!vaultKey) {
      toast.error(
        "Your vault is currently locked. Please unlock it to rotate keys.",
      );
      return;
    }

    if (!getPrivateKey()) {
      toast.error("Private key not found. Please log out and back in.");
      return;
    }

    setConfirmOpen(true);
  };

  const performRotation = async () => {
    if (!activeOrg?.id) return;

    const privateKey = getPrivateKey();
    if (!privateKey) {
      toast.error("Private key not found. Please log out and back in.");
      return;
    }

    setIsRotating(true);
    try {
      const activeMembersRes = await queryClient.fetchQuery(
        trpc.vault.getActiveMembers.queryOptions({
          organizationId: activeOrg.id,
        }),
      );

      const activeMembers = activeMembersRes.items
        .filter((m) => m.vaultKeyStatus === "active" && m.publicKey)
        .map((m) => ({
          userId: m.userId,
          publicKeyJwk: JSON.parse(atob(m.publicKey!)),
        }));

      const credentialsRes = await queryClient.fetchQuery(
        trpc.credential.getCredentials.queryOptions({
          organizationId: activeOrg.id,
          limit: 10000,
        }),
      );

      const currentVaultKeyRes = await queryClient.fetchQuery(
        trpc.vault.getMyVaultKey.queryOptions({
          organizationId: activeOrg.id,
        }),
      );

      toast.info("Re-encrypting all data...");

      const { reEncryptedCredentials, newWrappedKeys, newVaultKey } =
        await rotateVaultKey({
          currentEncryptedVaultKey:
            currentVaultKeyRes.vaultKeyData.encryptedKey,
          userPrivateKey: privateKey,
          activeMembers,
          credentials: credentialsRes.items.map((c) => ({
            id: c.id,
            type: c.type,
            username: c.username,
            password: c.password,
            url: c.url,
            otp: c.otp,
            note: c.note,
            data: c.data as Record<string, string> | null,
          })),
        });

      toast.info("Uploading rotated keys...");
      await rotateMutation.mutateAsync({
        organizationId: activeOrg.id,
        newMemberKeys: newWrappedKeys,
        reEncryptedCredentials,
      });

      useVaultStore.getState().setVaultKey(newVaultKey);

      toast.success("Vault key rotated successfully.");
    } catch (error) {
      console.error("Rotation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to rotate vault key.",
      );
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCwIcon className="size-4" aria-hidden="true" /> Rotate Vault
            Key
          </CardTitle>
          <CardDescription>
            Generate a new encryption key for your organization&apos;s vault.
            This process re-encrypts all credentials and re-wraps the new key
            for all active members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border-destructive/20 text-foreground flex gap-3 rounded-lg border p-4 text-sm">
            <AlertCircleIcon
              className="text-destructive mt-0.5 size-5 shrink-0 dark:text-red-400"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-medium">Warning</p>
              <p>
                Rotating the vault key is a computationally expensive operation.
                Depending on the number of credentials and members in your
                organization, this may take several seconds. Please do not close
                the browser while rotation is in progress.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={handleRotate}
            disabled={isRotating}
          >
            {isRotating ? (
              <>
                <Loader2Icon
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />{" "}
                Rotating...
              </>
            ) : (
              <>
                <KeyRoundIcon className="mr-2 size-4" aria-hidden="true" />{" "}
                Rotate Organization Key
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Rotate organization vault key?"
        description="This decrypts and re-encrypts every credential, then re-wraps the vault key for all active members. This process cannot be undone."
        confirmLabel="Rotate key"
        destructive
        isPending={isRotating}
        onConfirm={async () => {
          await performRotation();
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
