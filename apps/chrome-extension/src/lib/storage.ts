const API_BASE_URL_KEY = "vaultcore_api_base_url";
const ACTIVE_ORG_KEY = "vaultcore_active_org_id";
const DEFAULT_API_URL = import.meta.env.VITE_WEB_APP_URL ?? "http://localhost:3000";

import { getAuthClient } from "./auth";

export async function getApiBaseUrl(): Promise<string> {
  const result = await chrome.storage.local.get(API_BASE_URL_KEY);
  return (result[API_BASE_URL_KEY] as string) || DEFAULT_API_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [API_BASE_URL_KEY]: url });
}

export async function getActiveOrganizationId(): Promise<string | null> {
  const result = await chrome.storage.local.get(ACTIVE_ORG_KEY);
  return (result[ACTIVE_ORG_KEY] as string) || null;
}

export async function setActiveOrganizationId(id: string): Promise<void> {
  await chrome.storage.local.set({ [ACTIVE_ORG_KEY]: id });
}

export async function clearStorage(): Promise<void> {
  await chrome.storage.local.remove([API_BASE_URL_KEY, ACTIVE_ORG_KEY]);
}

/**
 * Resolve the active organization: the live session wins (it reflects switches
 * made in the web app), the local cache is only a fallback. Persists the result.
 */
export async function resolveActiveOrganizationId(
  apiBaseUrl: string,
): Promise<string | null> {
  const authClient = getAuthClient(apiBaseUrl);
  const { data: session } = await authClient.getSession();

  // The organization plugin adds activeOrganizationId to the session
  const activeOrgId = (session?.session as Record<string, unknown>)
    ?.activeOrganizationId as string | undefined;

  if (activeOrgId) {
    await setActiveOrganizationId(activeOrgId);
    return activeOrgId;
  }

  const cached = await getActiveOrganizationId();
  if (cached) return cached;

  return null;
}
