import type { TCredential } from "@/lib/types";
import { useEffect, useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getActiveOrganizationId } from "@/lib/storage";
import { ArrowLeftIcon, ExternalLinkIcon, StarIcon, ZapIcon } from "lucide-react";

import { decryptStringOrPlaintext } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";

import { CopyButton } from "../components/CopyButton";
import { PasswordField } from "../components/PasswordField";

interface CredentialDetailScreenProps {
  credentialId: string;
  onBack: () => void;
  apiBaseUrl: string;
}

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

        const found = result.items.find((c) => c.id === credentialId);

        if (!vaultKey) {
          throw new Error("Vault is locked");
        }

        if (found) {
          const dec = async (v: string | null) => {
            if (!v) return null;
            try {
              return await decryptStringOrPlaintext(v, vaultKey);
            } catch {
              return null;
            }
          };
          const decrypted = {
            ...found,
            title: (await dec(found.title)) ?? "",
            username: await dec(found.username),
            password: await dec(found.password),
            url: await dec(found.url),
            note: await dec(found.note),
            otp: await dec(found.otp),
          };
          setCredential(decrypted);
        } else {
          setError("Credential not found");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load credential";
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
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "AUTOFILL",
            payload: {
              username: credential.username || "",
              password: credential.password || "",
            },
          },
          (response) => {
            if (response?.success) {
              window.close();
            }
          },
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" role="status">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-border flex items-center border-b px-3 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="text-muted-foreground"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-muted-foreground text-sm">{error || "Not found"}</p>
        </div>
      </div>
    );
  }

  let faviconUrl: string | undefined;
  if (credential.type === "login" && credential.url) {
    try {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(credential.url).hostname}&sz=64`;
    } catch {
      faviconUrl = undefined;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center gap-2 border-b px-3 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <span className="text-foreground text-sm font-medium">Details</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title section */}
        <div className="border-border flex items-center gap-3 border-b px-4 py-4">
          <Avatar>
            <AvatarImage src={faviconUrl} />
            <AvatarFallback className="text-sm font-medium capitalize">
              {credential.title[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-foreground truncate text-base font-semibold">
                {credential.title}
              </h2>
              {credential.isFavorite && (
                <StarIcon className="fill-primary text-primary size-4 shrink-0" />
              )}
            </div>
            <span className="text-muted-foreground text-xs capitalize">
              {credential.type.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Auto-fill button */}
        {credential.type === "login" &&
          (credential.username || credential.password) && (
            <div className="border-border border-b px-4 py-3">
              <Button onClick={handleAutofill} className="w-full">
                <ZapIcon className="size-4" />
                Auto-fill on this page
              </Button>
            </div>
          )}

        {/* Fields */}
        <div className="divide-border flex flex-col divide-y">
          {/* Username */}
          {credential.username && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-muted-foreground text-xs font-medium">
                Username / Email
              </span>
              <div className="flex items-center justify-between">
                <span className="text-foreground truncate text-sm">
                  {credential.username}
                </span>
                <CopyButton text={credential.username} label="Username" />
              </div>
            </div>
          )}

          {/* Password */}
          {credential.password && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-muted-foreground text-xs font-medium">
                Password
              </span>
              <PasswordField value={credential.password} />
            </div>
          )}

          {/* URL */}
          {credential.url && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-muted-foreground text-xs font-medium">
                Website
              </span>
              <div className="flex items-center justify-between gap-2">
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground flex min-w-0 items-center gap-1 truncate text-sm hover:underline"
                >
                  <span className="truncate">{credential.url}</span>
                  <ExternalLinkIcon className="shrink-0" />
                </a>
                <CopyButton text={credential.url} label="URL" />
              </div>
            </div>
          )}

          {/* OTP */}
          {credential.otp && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-muted-foreground text-xs font-medium">
                OTP / 2FA Secret
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground truncate font-mono text-sm">
                  {credential.otp}
                </span>
                <CopyButton text={credential.otp} label="OTP" />
              </div>
            </div>
          )}

          {/* Notes */}
          {credential.note && (
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="text-muted-foreground text-xs font-medium">
                Notes
              </span>
              <p className="text-foreground text-sm whitespace-pre-wrap">
                {credential.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
