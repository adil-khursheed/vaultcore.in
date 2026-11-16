import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "@repo/auth";

function createAuthClientFor(baseUrl: string) {
  return createAuthClient({
    baseURL: baseUrl,
    plugins: [organizationClient(), inferAdditionalFields<Auth>()],
    fetchOptions: {
      credentials: "include",
    },
  });
}

type AuthClient = ReturnType<typeof createAuthClientFor>;

// One client instance per base URL — creating a fresh client each render makes
// useSession loop forever (React error #185)
const clients = new Map<string, AuthClient>();

export function getAuthClient(baseUrl: string): AuthClient {
  const existing = clients.get(baseUrl);
  if (existing) return existing;

  const authClientInstance = createAuthClientFor(baseUrl);
  clients.set(baseUrl, authClientInstance);
  return authClientInstance;
}
