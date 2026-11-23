import { useEffect, useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import {
  hasPinWrappedKey,
  resolveActiveOrganizationId,
  touchActivity,
  unwrapKeyWithPin,
} from "@/lib/storage";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, LogOutIcon } from "lucide-react";

import {
  decryptPrivateKey,
  deriveMasterKey,
  unwrapVaultKeyFromMember,
} from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";

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
  const [pin, setPin] = useState("");
  const [pinAvailable, setPinAvailable] = useState(false);
  const [usePin, setUsePin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setMasterKey, setVaultKey, setPrivateKey, unlockWithVaultKey } =
    useVaultStore();

  const authClient = getAuthClient(apiBaseUrl);
  const { data } = authClient.useSession();

  useEffect(() => {
    let cancelled = false;
    void hasPinWrappedKey().then((available) => {
      if (!cancelled) {
        setPinAvailable(available);
        setUsePin(available);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePinUnlock = async () => {
    if (!pin.trim()) {
      setError("Enter your PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const vaultKey = await unwrapKeyWithPin(pin.trim());
      unlockWithVaultKey(vaultKey);
      await touchActivity();
      setPin("");
      onUnlock();
    } catch {
      setError("That PIN didn't work. Try your master password instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    const user = data?.user;

    if (!user) {
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
      // 1. Derive the master key from the master password (client-side only)
      const masterKey = await deriveMasterKey(password, user.email);

      // 2. Decrypt the user's RSA private key with the master key
      if (!user.encryptedPrivateKey || !user.privateKeyIv) {
        setError(
          "Your account needs key migration. Open the VaultCore web app to complete it.",
        );
        return;
      }

      const privateKey = await decryptPrivateKey(
        {
          encryptedPrivateKey: user.encryptedPrivateKey,
          iv: user.privateKeyIv,
        },
        masterKey,
      );

      // 3. Fetch and unwrap the vault key with the private key
      const orgId = await resolveActiveOrganizationId(apiBaseUrl);
      if (!orgId) {
        setError(
          "No organization found. Please set up your vault in the web app.",
        );
        return;
      }

      const trpc = getTrpcClient(apiBaseUrl);
      const result = await trpc.vault.getMyVaultKey.query({
        organizationId: orgId,
      });

      if (!result?.vaultKeyData?.encryptedKey) {
        throw new Error("Vault key not found for this organization.");
      }

      const vaultKey = await unwrapVaultKeyFromMember(
        result.vaultKeyData.encryptedKey,
        privateKey,
      );

      // Keys live only in memory — cleared on lock/auto-lock/logout
      setPrivateKey(privateKey);
      setMasterKey(masterKey);
      setVaultKey(vaultKey);
      await touchActivity();

      setPassword("");
      onUnlock();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to unlock vault";
      setError(
        message.includes("decrypt") || message.includes("operation")
          ? "Failed to unlock your vault. Check your master password."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const openWebApp = () => {
    chrome.tabs.create({ url: apiBaseUrl });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <LockIcon className="text-primary size-8" />
        <h1 className="text-lg font-semibold tracking-tight">Unlock Vault</h1>
        <p className="text-muted-foreground text-center text-xs">
          {usePin
            ? "Enter your PIN to unlock"
            : "Enter your master password to unlock"}
        </p>
      </div>

      {error && (
        <div className="text-destructive w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs">
          {error}
          {error.includes("migration") && (
            <Button
              variant="link"
              size="sm"
              onClick={openWebApp}
              className="text-primary mt-1 h-auto p-0 text-xs"
            >
              Open the web app
            </Button>
          )}
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        {usePin ? (
          <InputGroup className="h-11">
            <InputGroupAddon>
              <LockIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinUnlock()}
              autoFocus
            />
          </InputGroup>
        ) : (
          <InputGroup className="h-11">
            <InputGroupAddon>
              <LockIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type={showPassword ? "text" : "password"}
              placeholder="Enter your master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              autoFocus
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        )}

        <Button
          onClick={usePin ? handlePinUnlock : handleUnlock}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : usePin ? (
            "Unlock with PIN"
          ) : (
            "Unlock"
          )}
        </Button>

        {pinAvailable ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUsePin(!usePin);
              setError("");
            }}
            className="text-muted-foreground h-8 text-xs"
          >
            {usePin ? "Use master password" : "Use PIN"}
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-muted-foreground h-8 text-xs"
        >
          <LogOutIcon className="size-3" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
