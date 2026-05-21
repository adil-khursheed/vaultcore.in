import { useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import { getActiveOrganizationId, getApiBaseUrl } from "@/lib/storage";
import { Loader2Icon, LockKeyholeIcon, LogOutIcon } from "lucide-react";

import { deriveMasterKey } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

interface VaultUnlockScreenProps {
  apiBaseUrl: string;
  onUnlock: () => void;
  onLogout: () => void;
}

export function VaultUnlockScreen({
  apiBaseUrl,
  onUnlock,
  onLogout,
}: VaultUnlockScreenProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setMasterKey, setVaultKey } = useVaultStore();

  const authClient = getAuthClient(apiBaseUrl);
  const { data } = authClient.useSession();

  const handleUnlock = async () => {
    if (!data) {
      setError("User is not authenticated. Please login first.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your master password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Derive master key from password
      const masterKey = await deriveMasterKey(password, data?.user.email);
      setMasterKey(masterKey);

      // 2. Fetch the user's encrypted vault key
      const orgId = await getActiveOrganizationId();
      if (!orgId) {
        throw new Error("No active organization. Please select one.");
      }

      const trpc = getTrpcClient(apiBaseUrl);
      const result = await trpc.vault.getMyVaultKey.query({
        organizationId: orgId,
      });

      if (!result?.vaultKeyData?.encryptedKey) {
        throw new Error("Vault key not found for this organization.");
      }

      // TODO: Unwrap the vault key with the user's RSA private key
      // For now, mark as unlocked — full RSA flow requires private key from session
      onUnlock();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unlock vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <LockKeyholeIcon className="text-primary size-10" />
        <h1 className="text-lg font-semibold">Unlock Vault</h1>
        <p className="text-muted-foreground text-center text-xs">
          Enter your master password to unlock
        </p>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive w-full rounded-md border px-3 py-2 text-xs">
          {error}
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        <input
          type="password"
          placeholder="Master Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
          autoFocus
        />
        <Button onClick={handleUnlock} disabled={loading} className="w-full">
          {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Unlock"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-muted-foreground text-xs"
        >
          <LogOutIcon className="mr-1 size-3" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
