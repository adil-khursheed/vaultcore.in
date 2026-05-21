"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  computeKeyFingerprint,
  decryptVaultKey,
  encryptPrivateKey,
  generateUserKeyPair,
  wrapVaultKeyForMember,
} from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export default function MigrationWizard() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { masterKey, setPrivateKey, clearKeys } = useVaultStore();

  const migrateUserKeys = useMutation(
    trpc.migration.migrateUserKeys.mutationOptions(),
  );
  const migrateLegacyVaultKeys = useMutation(
    trpc.migration.migrateLegacyVaultKeys.mutationOptions(),
  );

  const [step, setStep] = useState<"welcome" | "migrating" | "done">("welcome");
  const [fingerprint, setFingerprint] = useState<string>("");

  const startMigration = async () => {
    if (!masterKey) {
      toast.error("Master key is missing. Please log in again.");
      router.replace("/login");
      return;
    }

    setStep("migrating");

    try {
      // 1. Generate RSA Key Pair
      const userKeyPair = await generateUserKeyPair();
      const encryptedPrivKeyData = await encryptPrivateKey(
        userKeyPair.privateKey,
        masterKey,
      );

      const publicKeyJwk = await crypto.subtle.exportKey(
        "jwk",
        userKeyPair.publicKey,
      );
      const publicKeyBase64 = btoa(JSON.stringify(publicKeyJwk));

      // 2. Compute fingerprint
      const newFingerprint = await computeKeyFingerprint(publicKeyJwk);
      setFingerprint(newFingerprint);

      // 3. Save User Keys
      await migrateUserKeys.mutateAsync({
        publicKey: publicKeyBase64,
        encryptedPrivateKey: encryptedPrivKeyData.encryptedPrivateKey,
        privateKeyIv: encryptedPrivKeyData.iv,
        publicKeyFingerprint: newFingerprint,
      });

      // 4. Migrate Legacy Vault Keys
      const legacyKeys = await queryClient.fetchQuery(
        trpc.migration.getLegacyVaultKeys.queryOptions(),
      );

      const newWrappedKeys: {
        organizationId: string;
        encryptedKey: string;
        status: "active" | "pending";
      }[] = [];

      for (const legacy of legacyKeys.legacyKeys) {
        // Decrypt the old AES-GCM vault key using the master key
        try {
          const oldVaultKey = await decryptVaultKey(
            { encryptedKey: legacy.key, iv: legacy.iv },
            masterKey,
          );

          // Wrap the vault key with the new RSA public key
          const wrappedKey = await wrapVaultKeyForMember(
            oldVaultKey,
            publicKeyJwk,
          );

          // If they are admin or owner, it's active. For others, let's keep it active
          // since they are migrating their own existing access.
          newWrappedKeys.push({
            organizationId: legacy.organizationId,
            encryptedKey: wrappedKey,
            status: "active",
          });
        } catch (err) {
          console.error(
            "Failed to migrate key for org:",
            legacy.organizationId,
            err,
          );
        }
      }

      if (newWrappedKeys.length > 0) {
        await migrateLegacyVaultKeys.mutateAsync({
          keys: newWrappedKeys,
        });
      }

      setPrivateKey(userKeyPair.privateKey);
      setStep("done");
    } catch (error: unknown) {
      console.error("Migration failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to complete migration",
      );
      setStep("welcome"); // allow retry
    }
  };

  const handleFinish = async () => {
    // Refresh user session data to get the new publicKey state
    // We can clear keys and force a re-login to ensure a clean state, or redirect to home.
    // Let's redirect to root which will handle routing to active org.
    clearKeys();
    toast.success("Security upgrade complete! Please log in again.");
    router.replace("/login");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        {step === "welcome" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheckIcon className="text-primary size-6" />
                Security Upgrade Required
              </CardTitle>
              <CardDescription>
                VaultCore has upgraded its security infrastructure to use
                industry-standard RSA-OAEP encryption with public key
                fingerprints.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-md p-4 text-sm">
                <h4 className="mb-2 font-medium">What&apos;s changing?</h4>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  <li>Stronger cross-organization encryption</li>
                  <li>Man-in-the-middle attack protection</li>
                  <li>Verifiable identity fingerprints</li>
                </ul>
              </div>
              <p className="text-muted-foreground text-sm">
                We need to generate a new security key pair for your device and
                upgrade your existing vaults. This will only take a few seconds.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={startMigration} className="w-full">
                Start Upgrade
              </Button>
            </CardFooter>
          </>
        )}

        {step === "migrating" && (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2Icon className="text-primary mb-6 size-12 animate-spin" />
            <h3 className="mb-2 text-lg font-medium">
              Upgrading Security Infrastructure
            </h3>
            <p className="text-muted-foreground text-sm">
              Generating RSA key pair and securing your vaults...
              <br />
              Please do not close this window.
            </p>
          </CardContent>
        )}

        {step === "done" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheckIcon className="size-6 text-green-500" />
                Upgrade Successful
              </CardTitle>
              <CardDescription>
                Your security upgrade is complete. You have been assigned a
                unique public key fingerprint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-md p-4 text-center">
                <p className="mb-2 flex items-center justify-center gap-2 text-sm font-medium">
                  <KeyRoundIcon className="size-4" /> Your Key Fingerprint
                </p>
                <code className="bg-background text-primary block rounded px-3 py-2 font-mono text-sm tracking-wider break-all">
                  {fingerprint}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    navigator.clipboard.writeText(fingerprint);
                    toast.success("Fingerprint copied to clipboard");
                  }}
                >
                  <CopyIcon className="mr-2 size-4" /> Copy Fingerprint
                </Button>
              </div>
              <p className="text-muted-foreground flex gap-2 text-sm">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                Organization administrators may ask you to verify this
                fingerprint before granting you access to new vaults in the
                future.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleFinish} className="w-full">
                Continue to Login
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
