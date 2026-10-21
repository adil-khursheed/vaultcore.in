import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@repo/api";

import { getApiBaseUrl } from "./storage";

let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>> | null = null;
let currentBaseUrl: string | null = null;

/**
 * Get or create a tRPC client for the Chrome extension.
 * The client is cached as a singleton and re-created if the base URL changes.
 *
 * @param apiBaseUrl - Optional base URL override. If not provided, reads from chrome storage.
 */
export function getTrpcClient(apiBaseUrl?: string): ReturnType<typeof createTRPCClient<AppRouter>> {
  const baseUrl = apiBaseUrl ?? currentBaseUrl;

  // Return cached client if URL hasn't changed
  if (trpcClient && currentBaseUrl === baseUrl && baseUrl) {
    return trpcClient;
  }

  if (!baseUrl) {
    // Synchronous fallback — create with default URL
    // Callers should prefer passing apiBaseUrl for guaranteed correctness
    const defaultUrl = "http://localhost:3000";
    return createClient(defaultUrl);
  }

  return createClient(baseUrl);
}

/**
 * Async version that reads from chrome storage if no URL is provided.
 */
export async function getTrpcClientAsync(): Promise<ReturnType<typeof createTRPCClient<AppRouter>>> {
  const baseUrl = await getApiBaseUrl();
  return getTrpcClient(baseUrl);
}

function createClient(baseUrl: string) {
  currentBaseUrl = baseUrl;
  trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        transformer: SuperJSON,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
  return trpcClient;
}

/**
 * Reset the cached tRPC client (e.g., on logout or base URL change).
 */
export function resetTrpcClient() {
  trpcClient = null;
  currentBaseUrl = null;
}
