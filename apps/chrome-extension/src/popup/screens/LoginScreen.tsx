import { useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import { setActiveOrganizationId } from "@/lib/storage";
import {
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react";

import {
  decryptPrivateKey,
  deriveKeys,
  unwrapVaultKeyFromMember,
} from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";

interface LoginScreenProps {
  apiBaseUrl: string;
  onLogin: () => void;
}

export function LoginScreen({ apiBaseUrl, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setMasterKey, setVaultKey, setPrivateKey } = useVaultStore();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const authClient = getAuthClient(apiBaseUrl);
      const { masterKey, passwordHash } = await deriveKeys(password, email);
      const result = await authClient.signIn.email({
        email,
        password: passwordHash,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
        return;
      }

      const user = result.data.user;

      // Same flow as the web login: master password also unlocks the vault
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

      // Activate the personal organization, like the web login does
      const activeOrg = await authClient.organization.setActive({
        organizationSlug: user.id,
      });
      const orgId = activeOrg?.data?.id;
      if (!orgId) {
        throw new Error("No organization found. Please set up your vault first.");
      }
      await setActiveOrganizationId(orgId);

      // Unwrap the vault key and land directly in the vault
      const trpc = getTrpcClient(apiBaseUrl);
      const vaultResult = await trpc.vault.getMyVaultKey.query({
        organizationId: orgId,
      });
      const vaultKey = await unwrapVaultKeyFromMember(
        vaultResult.vaultKeyData.encryptedKey,
        privateKey,
      );

      // Keys live only in memory — cleared on lock/auto-lock/logout
      setPrivateKey(privateKey);
      setMasterKey(masterKey);
      setVaultKey(vaultKey);

      setPassword("");
      onLogin();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(
        message.includes("decrypt") || message.includes("operation")
          ? "Failed to unlock your vault. Check your master password."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <KeyRoundIcon className="text-primary size-8" />
        <h1 className="text-lg font-semibold tracking-tight">VaultCore</h1>
        <p className="text-muted-foreground text-center text-xs">
          Sign in to access your credentials
        </p>
      </div>

      {error && (
        <div className="text-destructive w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs">
          {error}
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        <InputGroup className="h-11">
          <InputGroupAddon>
            <MailIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </InputGroup>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <LockIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </InputGroup>
        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </div>
  );
}
