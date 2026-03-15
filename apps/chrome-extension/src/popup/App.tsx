import { useEffect, useState } from "react";
import { getAuthClient } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/storage";

import { useVaultStore } from "@repo/store";
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

  const { vaultKey } = useVaultStore();

  useEffect(() => {
    async function init() {
      try {
        const baseUrl = await getApiBaseUrl();
        setApiBaseUrl(baseUrl);

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
            onLogin={() => {
              if (!vaultKey) {
                navigate("lock");
              } else {
                navigate("list");
              }
            }}
          />
        );

      case "lock":
        return (
          <VaultUnlockScreen
            apiBaseUrl={apiBaseUrl}
            onUnlock={() => navigate("list")}
            onLogout={() => {
              useVaultStore.getState().clearKeys();
              navigate("login");
            }}
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
            onLogout={() => {
              useVaultStore.getState().clearKeys();
              navigate("login");
            }}
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
