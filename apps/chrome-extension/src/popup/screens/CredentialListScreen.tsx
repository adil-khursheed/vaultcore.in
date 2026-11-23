import type { CredentialType, TCredential } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import {
  cacheCredentials,
  getCachedCredentials,
  resolveActiveOrganizationId,
} from "@/lib/storage";
import { AlertTriangleIcon, Loader2Icon, LogOutIcon, PlusIcon } from "lucide-react";

import { decryptStringOrPlaintext } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

import { AutofillBanner } from "../components/AutofillBanner";
import { CredentialListItem } from "../components/CredentialListItem";
import { SearchBar } from "../components/SearchBar";
import { useRouter } from "../router";

interface CredentialListScreenProps {
  onSelectCredential: (id: string) => void;
  onAddCredential: () => void;
  onLogout: () => void;
  apiBaseUrl: string;
}

const FILTER_TABS: { label: string; value: CredentialType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Logins", value: "login" },
  { label: "Cards", value: "card" },
  { label: "Notes", value: "note" },
  { label: "Identity", value: "identity" },
];

// Decrypt one field; a row that cannot be decrypted stays usable (like the web app)
async function safeDecrypt(value: string | null, vaultKey: CryptoKey) {
  if (!value) return null;
  try {
    return await decryptStringOrPlaintext(value, vaultKey);
  } catch {
    return null;
  }
}

async function decryptItems(items: TCredential[], vaultKey: CryptoKey) {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      title: item.title
        ? ((await safeDecrypt(item.title, vaultKey)) ?? "")
        : "",
      username: await safeDecrypt(item.username, vaultKey),
      password: await safeDecrypt(item.password, vaultKey),
      url: await safeDecrypt(item.url, vaultKey),
      note: await safeDecrypt(item.note, vaultKey),
      otp: await safeDecrypt(item.otp, vaultKey),
    })),
  );
}

export function CredentialListScreen({
  onSelectCredential,
  onAddCredential,
  onLogout,
  apiBaseUrl,
}: CredentialListScreenProps) {
  const [credentials, setCredentials] = useState<TCredential[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CredentialType | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);

  const { vaultKey } = useVaultStore();

  const { navigate } = useRouter();

  // Get current tab URL
  useEffect(() => {
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentTabUrl(tabs[0].url);
      }
    });
  }, []);

  // Get active organization and fetch credentials
  useEffect(() => {
    async function loadData() {
      if (!vaultKey) {
        navigate("lock");
        return;
      }

      setLoading(true);
      setError("");
      setOffline(false);

      let orgId: string | null = null;

      try {
        orgId = await resolveActiveOrganizationId(apiBaseUrl);
        if (!orgId) {
          setError(
            "No organization found. Please set up your vault in the web app.",
          );
          return;
        }

        const trpc = getTrpcClient(apiBaseUrl);
        const result = await trpc.credential.getCredentials.query({
          organizationId: orgId,
          limit: 100,
          isDeleted: false,
        });

        // Keep an encrypted copy so the popup still works offline.
        await cacheCredentials(orgId, result.items);

        // Decrypt all fields client-side; the server only ever sees ciphertext
        setCredentials(await decryptItems(result.items as TCredential[], vaultKey));
      } catch (err: unknown) {
        // Network/server failure: fall back to the last encrypted snapshot.
        const cached = orgId
          ? await getCachedCredentials<TCredential>(orgId)
          : null;

        if (cached && cached.length > 0) {
          setCredentials(await decryptItems(cached, vaultKey));
          setOffline(true);
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load credentials";
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [apiBaseUrl, vaultKey, navigate]);

  // Tell the service worker which hosts have credentials so it can render a
  // badge count on the toolbar without ever seeing decrypted data.
  useEffect(() => {
    const hosts: Record<string, number> = {};

    for (const credential of credentials) {
      if (!credential.url) continue;
      try {
        const hostname = new URL(credential.url).hostname.replace(/^www\./, "");
        hosts[hostname] = (hosts[hostname] ?? 0) + 1;
      } catch {
        // Ignore malformed URLs.
      }
    }

    chrome.runtime?.sendMessage?.({
      type: "SET_CREDENTIAL_HOSTS",
      payload: { hosts },
    });
  }, [credentials]);

  // Filter and search credentials
  const filteredCredentials = useMemo(() => {
    let filtered = credentials;

    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((c) => c.type === activeFilter);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.title ?? "").toLowerCase().includes(q) ||
          (c.username ?? "").toLowerCase().includes(q) ||
          (c.url ?? "").toLowerCase().includes(q) ||
          (c.note ?? "").toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [credentials, activeFilter, search]);

  // Find credentials matching current tab URL
  const matchingCredentials = useMemo(() => {
    if (!currentTabUrl) return [];
    try {
      const currentHost = new URL(currentTabUrl).hostname;
      return credentials.filter((c) => {
        if (!c.url || c.type !== "login") return false;
        try {
          const credHost = new URL(c.url).hostname;
          return (
            currentHost === credHost ||
            currentHost.endsWith(`.${credHost}`) ||
            credHost.endsWith(`.${currentHost}`)
          );
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }, [credentials, currentTabUrl]);

  const handleAutofill = () => {
    const cred = matchingCredentials[0];
    if (!cred) return;

    // Multiple matches: show them all instead of guessing one
    if (matchingCredentials.length > 1) {
      setActiveFilter("login");
      setSearch(
        currentTabUrl
          ? (() => {
              try {
                return new URL(currentTabUrl).hostname;
              } catch {
                return "";
              }
            })()
          : "",
      );
      return;
    }

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "AUTOFILL",
            payload: {
              username: cred.username || "",
              password: cred.password || "",
            },
          },
          (response) => {
            if (response?.success) {
              // Password-manager convention: close the popup once filled
              window.close();
            }
          },
        );
      }
    });
  };

  const handleLogout = async () => {
    try {
      const authClient = getAuthClient(apiBaseUrl);
      await authClient.signOut();
      onLogout();
    } catch {
      onLogout();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex h-12 items-center justify-between border-b px-4">
        <span className="text-foreground text-sm font-semibold tracking-tight">
          VaultCore
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onAddCredential}
            className="text-muted-foreground"
            title="Add credential"
          >
            <PlusIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            className="text-muted-foreground"
            title="Sign out"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 pb-0">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeFilter === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter(tab.value)}
            className="h-7 px-2.5 text-xs shadow-none"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Autofill banner */}
      <AutofillBanner
        count={matchingCredentials.length}
        onAutofill={handleAutofill}
      />

      {/* Offline banner */}
      {offline && (
        <div className="border-border bg-muted/50 text-muted-foreground mx-3 mb-2 rounded-md border px-3 py-2 text-xs">
          Offline — showing cached items.
        </div>
      )}

      {/* Credential list */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 pt-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center" role="status">
            <Loader2Icon className="text-primary size-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center">
            <AlertTriangleIcon
              className="text-muted-foreground size-6"
              aria-hidden="true"
            />
            <p className="text-muted-foreground text-sm">
              Couldn&apos;t load your items.
            </p>
            <p className="text-destructive text-xs">{error}</p>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-muted-foreground text-sm">
              {search ? "No results for your search." : "No items found."}
            </p>
            {!search && (
              <Button
                variant="link"
                size="sm"
                onClick={onAddCredential}
                className="text-primary h-auto p-0 text-xs"
              >
                Create a new credential to get started.
              </Button>
            )}
          </div>
        ) : (
          filteredCredentials.map((credential) => (
            <CredentialListItem
              key={credential.id}
              credential={credential}
              onClick={() => onSelectCredential(credential.id)}
              isMatching={matchingCredentials.some(
                (m) => m.id === credential.id,
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
