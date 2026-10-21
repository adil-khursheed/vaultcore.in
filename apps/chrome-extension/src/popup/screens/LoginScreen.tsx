import { useState } from "react";
import { getAuthClient } from "@/lib/auth";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";

import { Button } from "@repo/ui/components/button";

interface LoginScreenProps {
  apiBaseUrl: string;
  onLogin: () => void;
}

export function LoginScreen({ apiBaseUrl, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const authClient = getAuthClient(apiBaseUrl);
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        onLogin();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2">
        <KeyRoundIcon className="text-primary size-10" />
        <h1 className="text-lg font-semibold">VaultCore</h1>
        <p className="text-muted-foreground text-center text-xs">
          Sign in to access your credentials
        </p>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive w-full rounded-md border px-3 py-2 text-xs">
          {error}
        </div>
      )}

      <div className="flex w-full flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
        />
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
