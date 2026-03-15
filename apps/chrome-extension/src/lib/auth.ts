import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export function getAuthClient(baseUrl: string) {
  const authClientInstance = createAuthClient({
    baseURL: baseUrl,
    plugins: [organizationClient()],
    fetchOptions: {
      credentials: "include",
    },
  });

  return authClientInstance;
}

// export function resetAuthClient() {
//   authClientInstance = null;
// }
