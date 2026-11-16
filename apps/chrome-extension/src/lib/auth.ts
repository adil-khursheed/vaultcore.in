import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "@repo/auth";

// One client instance per base URL — creating a fresh client each render makes
// useSession loop forever (React error #185)
const clients = new Map<
  string,
  ReturnType<typeof createAuthClient<{ plugins: [ReturnType<typeof inferAdditionalFields<Auth>>] }>>
>();

export function getAuthClient(baseUrl: string) {
  const existing = clients.get(baseUrl);
  if (existing) return existing;

  const authClientInstance = createAuthClient({
    baseURL: baseUrl,
    plugins: [organizationClient(), inferAdditionalFields<Auth>()],
    fetchOptions: {
      credentials: "include",
    },
  });

  clients.set(baseUrl, authClientInstance);
  return authClientInstance;
}
