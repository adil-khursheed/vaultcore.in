import type { CredentialType, TCredential } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import {
  getActiveOrganizationId,
  setActiveOrganizationId,
} from "@/lib/storage";
import { LogOutIcon, PlusIcon, ShieldIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";

import { AutofillBanner } from "../components/AutofillBanner";
import { CredentialListItem } from "../components/CredentialListItem";
import { SearchBar } from "../components/SearchBar";
import { useVaultStore } from "@repo/store";
import { decryptString } from "@/lib/crypto";

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
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const { vaultKey } = useVaultStore();

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
      try {
        setLoading(true);

        // Try to get organization ID
        let orgId = await getActiveOrganizationId();

        if (!orgId) {
          // Try to get org from the auth session
          const authClient = getAuthClient(apiBaseUrl);
          const { data: session } = await authClient.getSession();

          // The organization plugin adds activeOrganizationId to the session
          const activeOrgId = (session?.session as Record<string, unknown>)
            ?.activeOrganizationId as string | undefined;

          if (activeOrgId) {
            orgId = activeOrgId;
            await setActiveOrganizationId(orgId);
          }
        }

        if (!orgId) {
          setError("No organization found. Please set up your vault first.");
          setLoading(false);
          return;
        }

        setOrganizationId(orgId);

        const trpc = getTrpcClient(apiBaseUrl);
        const result = await trpc.credential.getCredentials.query({
          organizationId: orgId,
          limit: 100,
          isDeleted: false,
        });

        if (!vaultKey) {
          throw new Error("Vault is locked");
        }

        // Decrypt all fields
        const decryptedItems = await Promise.all(
          result.items.map(async (item: any) => ({
            ...item,
            username: item.username ? await decryptString(item.username, vaultKey) : null,
            password: item.password ? await decryptString(item.password, vaultKey) : null,
            url: item.url ? await decryptString(item.url, vaultKey) : null,
            note: item.note ? await decryptString(item.note, vaultKey) : null,
          }))
        );

        setCredentials(decryptedItems as TCredential[]);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load credentials";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [apiBaseUrl, vaultKey]);

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
          c.title.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q),
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
    if (matchingCredentials.length === 1) {
      // Auto-fill directly
      const cred = matchingCredentials[0];
      chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "AUTOFILL",
            payload: {
              username: cred?.username || "",
              password: cred?.password || "",
            },
          });
        }
      });
    } else if (matchingCredentials.length > 1) {
      // Show the matching credentials
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
    }
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
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldIcon className="text-primary h-5 w-5" />
          <h1 className="text-foreground text-sm font-semibold">VaultCore</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 text-muted-foreground"
          title="Sign out"
        >
          <LogOutIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 pb-2">
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

      {/* Credential list */}
      <div className="flex-1 overflow-y-auto px-2 pb-16">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-4">
            <p className="text-destructive text-center text-sm">{error}</p>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-muted-foreground text-sm">
              {search ? "No credentials found" : "No credentials yet"}
            </p>
            {!search && (
              <Button
                variant="link"
                size="sm"
                onClick={onAddCredential}
                className="h-auto p-0 text-xs text-primary"
              >
                Add your first credential
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredCredentials.map((credential) => (
              <CredentialListItem
                key={credential.id}
                credential={credential}
                onClick={() => onSelectCredential(credential.id)}
                isMatching={matchingCredentials.some(
                  (m) => m.id === credential.id,
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="absolute right-4 bottom-4">
        <Button
          size="icon"
          onClick={onAddCredential}
          className="h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95"
          title="Add credential"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
