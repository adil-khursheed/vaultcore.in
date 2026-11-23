import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "@repo/auth";

const SESSION_TOKEN_KEY = "vaultcore_session_token";

/**
 * The session token is stored alongside the cookie session. Sending it as a
 * bearer token keeps the extension working when third-party cookies are
 * blocked (Chrome's default is increasingly restrictive).
 */
export async function getSessionToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(SESSION_TOKEN_KEY);
  return (result[SESSION_TOKEN_KEY] as string) || null;
}

export async function setSessionToken(token: string | null): Promise<void> {
  if (token) {
    await chrome.storage.local.set({ [SESSION_TOKEN_KEY]: token });
  } else {
    await chrome.storage.local.remove(SESSION_TOKEN_KEY);
  }
}

async function extensionFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await getSessionToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // Better Auth's bearer plugin exposes the signed session token on every
  // response that issues or refreshes a session. Capture it so the extension
  // keeps working when third-party cookies are blocked.
  const issuedToken = response.headers.get("set-auth-token");
  if (issuedToken) {
    await setSessionToken(issuedToken);
  }

  return response;
}

function createAuthClientFor(baseUrl: string) {
  return createAuthClient({
    baseURL: baseUrl,
    plugins: [organizationClient(), inferAdditionalFields<Auth>()],
    fetchOptions: {
      credentials: "include",
      customFetchImpl: extensionFetch,
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
