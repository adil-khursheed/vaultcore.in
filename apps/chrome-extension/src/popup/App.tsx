import { useEffect, useRef, useState } from "react";
import { getAuthClient, setSessionToken } from "@/lib/auth";
import {
  clearPinWrappedKey,
  getApiBaseUrl,
  getLastActivity,
  touchActivity,
} from "@/lib/storage";

import { AUTO_LOCK_TIMEOUT_MS, useVaultStore } from "@repo/store";
import { Spinner } from "@repo/ui/components/spinner";

import { useRouter } from "./router";
import { AddCredentialScreen } from "./screens/AddCredentialScreen";
import { CredentialDetailScreen } from "./screens/CredentialDetailScreen";
import { CredentialListScreen } from "./screens/CredentialListScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { VaultUnlockScreen } from "./screens/VaultUnlockScreen";

export default function App() {
  const { route, navigate, goBack } = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | null
  >(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const lastTouchRef = useRef(0);

  const { vaultKey } = useVaultStore();

  const handleLogout = async () => {
    useVaultStore.getState().clearKeys();
    await clearPinWrappedKey();
    await setSessionToken(null);
    navigate("login");
  };

  useEffect(() => {
    async function init() {
      try {
        const baseUrl = await getApiBaseUrl();
        setApiBaseUrl(baseUrl);

        // If the popup hasn't been used for a while, forget the PIN so a
        // quick-unlock shortcut can't be reused indefinitely.
        const lastActivity = await getLastActivity();
        if (
          lastActivity &&
          Date.now() - lastActivity > AUTO_LOCK_TIMEOUT_MS
        ) {
          await clearPinWrappedKey();
        }

        const authClient = getAuthClient(baseUrl);
        const { data: session } = await authClient.getSession();

        if (session) {
          // Check for vaultKey in the store
          if (!vaultKey) {
            navigate("lock");
          } else {
            navigate("list");
          }
        } else {
          navigate("login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("login");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [navigate, vaultKey]);

  // Refresh activity while the popup is open and enforce auto-lock.
  useEffect(() => {
    const markActivity = () => {
      const now = Date.now();
      useVaultStore.getState().refreshActivity();

      if (now - lastTouchRef.current > 30_000) {
        lastTouchRef.current = now;
        void touchActivity();
      }
    };

    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    for (const event of events) {
      window.addEventListener(event, markActivity, { passive: true });
    }

    const interval = setInterval(() => {
      const state = useVaultStore.getState();
      if (
        !state.isLocked &&
        Date.now() - state.lastActivity > AUTO_LOCK_TIMEOUT_MS
      ) {
        state.clearKeys();
        navigate("lock");
      }
    }, 30_000);

    return () => {
      for (const event of events) {
        window.removeEventListener(event, markActivity);
      }
      clearInterval(interval);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-background flex h-[550px] w-[375px] items-center justify-center">
        <Spinner className="text-primary size-8" />
      </div>
    );
  }

  const renderScreen = () => {
    switch (route) {
      case "login":
        return (
          <LoginScreen
            apiBaseUrl={apiBaseUrl}
            // Login derives and unlocks the vault in one step — no lock screen
            onLogin={() => navigate("list")}
          />
        );

      case "lock":
        return (
          <VaultUnlockScreen
            apiBaseUrl={apiBaseUrl}
            onUnlock={() => navigate("list")}
            onLogout={handleLogout}
          />
        );

      case "list":
        return (
          <CredentialListScreen
            apiBaseUrl={apiBaseUrl}
            onSelectCredential={(id) => {
              setSelectedCredentialId(id);
              navigate("detail");
            }}
            onAddCredential={() => navigate("add")}
            onLogout={handleLogout}
          />
        );

      case "detail":
        if (!selectedCredentialId) {
          navigate("list");
          return null;
        }
        return (
          <CredentialDetailScreen
            apiBaseUrl={apiBaseUrl}
            credentialId={selectedCredentialId}
            onBack={goBack}
          />
        );

      case "add":
        return <AddCredentialScreen apiBaseUrl={apiBaseUrl} onBack={goBack} />;

      default:
        return null;
    }
  };

  return (
    <div className="bg-background flex h-[550px] w-[375px] flex-col overflow-hidden rounded-lg font-sans">
      {renderScreen()}
    </div>
  );
}
