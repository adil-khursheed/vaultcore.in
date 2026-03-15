const API_BASE_URL_KEY = "vaultcore_api_base_url";
const ACTIVE_ORG_KEY = "vaultcore_active_org_id";
const DEFAULT_API_URL = "http://localhost:3000";

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
