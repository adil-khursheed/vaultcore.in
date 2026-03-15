import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  GlobeIcon,
  CreditCardIcon,
  UserIcon,
  FileTextIcon,
  KeyIcon,
  ZapIcon,
  ExternalLinkIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";

import { getTrpcClient } from "@/lib/api";
import { getActiveOrganizationId } from "@/lib/storage";
import { decryptString } from "@/lib/crypto";
import type { TCredential, CredentialType } from "@/lib/types";
import { useVaultStore } from "@repo/store";

import { CopyButton } from "../components/CopyButton";
import { PasswordField } from "../components/PasswordField";

interface CredentialDetailScreenProps {
  credentialId: string;
  onBack: () => void;
  apiBaseUrl: string;
}

const typeIcons: Record<CredentialType, React.ReactNode> = {
  login: <GlobeIcon className="h-5 w-5" />,
  card: <CreditCardIcon className="h-5 w-5" />,
  identity: <UserIcon className="h-5 w-5" />,
  note: <FileTextIcon className="h-5 w-5" />,
  ssh_key: <KeyIcon className="h-5 w-5" />,
};

const typeLabels: Record<CredentialType, string> = {
  login: "Login",
  card: "Credit Card",
  identity: "Identity",
  note: "Secure Note",
  ssh_key: "SSH Key",
};

const typeColors: Record<CredentialType, string> = {
  login: "bg-blue-500/10 text-blue-400",
  card: "bg-amber-500/10 text-amber-400",
  identity: "bg-violet-500/10 text-violet-400",
  note: "bg-emerald-500/10 text-emerald-400",
  ssh_key: "bg-rose-500/10 text-rose-400",
};

export function CredentialDetailScreen({
  credentialId,
  onBack,
  apiBaseUrl,
}: CredentialDetailScreenProps) {
  const [credential, setCredential] = useState<TCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { vaultKey } = useVaultStore();

  useEffect(() => {
    async function loadCredential() {
      try {
        const orgId = await getActiveOrganizationId();
        if (!orgId) {
          setError("No organization found");
          return;
        }

        const trpc = getTrpcClient(apiBaseUrl);
        const result = await trpc.credential.getCredentials.query({
          organizationId: orgId,
          limit: 100,
          isDeleted: false,
        });

        const found = result.items.find(
          (c: any) => c.id === credentialId
        ) as TCredential | undefined;

        if (!vaultKey) {
          throw new Error("Vault is locked");
        }

        if (found) {
          const decrypted = {
            ...found,
            username: found.username ? await decryptString(found.username, vaultKey) : null,
            password: found.password ? await decryptString(found.password, vaultKey) : null,
            url: found.url ? await decryptString(found.url, vaultKey) : null,
            note: found.note ? await decryptString(found.note, vaultKey) : null,
          };
          setCredential(decrypted as TCredential);
        } else {
          setError("Credential not found");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load credential";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadCredential();
  }, [credentialId, apiBaseUrl, vaultKey]);

  const handleAutofill = () => {
    if (!credential?.username && !credential?.password) return;

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "AUTOFILL",
          payload: {
            username: credential.username || "",
            password: credential.password || "",
          },
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center border-b border-border px-3 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-destructive">{error || "Not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 text-muted-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">Details</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title section */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${typeColors[credential.type]}`}
          >
            {typeIcons[credential.type]}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-base font-semibold text-foreground">
                {credential.title}
              </h2>
              {credential.isFavorite && (
                <StarIcon className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {typeLabels[credential.type]}
            </span>
          </div>
        </div>

        {/* Auto-fill button */}
        {credential.type === "login" && (credential.username || credential.password) && (
          <div className="border-b border-border px-4 py-3">
            <Button
              onClick={handleAutofill}
              className="w-full"
            >
              <ZapIcon className="mr-2 h-4 w-4" />
              Auto-fill on this page
            </Button>
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col divide-y divide-border">
          {/* Username */}
          {credential.username && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Username / Email
              </span>
              <div className="flex items-center justify-between">
                <span className="truncate text-sm text-foreground">
                  {credential.username}
                </span>
                <CopyButton text={credential.username} />
              </div>
            </div>
          )}

          {/* Password */}
          {credential.password && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Password
              </span>
              <PasswordField value={credential.password} />
            </div>
          )}

          {/* URL */}
          {credential.url && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Website
              </span>
              <div className="flex items-center justify-between">
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 truncate text-sm text-primary hover:underline"
                >
                  {credential.url}
                  <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                </a>
                <CopyButton text={credential.url} />
              </div>
            </div>
          )}

          {/* OTP */}
          {credential.otp && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                OTP / 2FA Secret
              </span>
              <div className="flex items-center justify-between">
                <span className="truncate font-mono text-sm text-foreground">
                  {credential.otp}
                </span>
                <CopyButton text={credential.otp} />
              </div>
            </div>
          )}

          {/* Notes */}
          {credential.note && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Notes
              </span>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {credential.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
