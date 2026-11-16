import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "@repo/auth";

export function getAuthClient(baseUrl: string) {
  const authClientInstance = createAuthClient({
    baseURL: baseUrl,
    plugins: [organizationClient(), inferAdditionalFields<Auth>()],
    fetchOptions: {
      credentials: "include",
    },
  });

  return authClientInstance;
}
