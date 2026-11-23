const API_BASE_URL_KEY = "vaultcore_api_base_url";
const ACTIVE_ORG_KEY = "vaultcore_active_org_id";
const CREDENTIAL_CACHE_PREFIX = "vaultcore_credentials_cache_";
const PIN_WRAP_KEY = "vaultcore_pin_wrap";
const LAST_ACTIVITY_KEY = "vaultcore_last_activity";
const DEFAULT_API_URL = import.meta.env.VITE_WEB_APP_URL ?? "http://localhost:3000";

import { fromBase64, toBase64 } from "@repo/crypto";

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
  await chrome.storage.local.remove([
    API_BASE_URL_KEY,
    ACTIVE_ORG_KEY,
    PIN_WRAP_KEY,
    LAST_ACTIVITY_KEY,
  ]);
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

/**
 * Cache the *encrypted* credential list so the popup still works offline.
 * Decryption only ever happens in the popup with the in-memory vault key.
 */
export async function cacheCredentials(
  organizationId: string,
  items: unknown[],
): Promise<void> {
  await chrome.storage.local.set({
    [`${CREDENTIAL_CACHE_PREFIX}${organizationId}`]: {
      items,
      cachedAt: Date.now(),
    },
  });
}

export async function getCachedCredentials<T>(
  organizationId: string,
): Promise<T[] | null> {
  const key = `${CREDENTIAL_CACHE_PREFIX}${organizationId}`;
  const result = await chrome.storage.local.get(key);
  const entry = result[key] as { items?: T[] } | undefined;
  return entry?.items ?? null;
}

// --- PIN quick unlock ---
//
// The vault key is exported once and wrapped with a key derived from the PIN
// via PBKDF2 + AES-GCM. Only the wrapped blob is stored, so a stolen profile
// still needs the PIN (and a brute-force cost) to recover the key.

interface PinWrapRecord {
  salt: string;
  iv: string;
  data: string;
  iterations: number;
}

const PIN_ITERATIONS = 310_000;

async function derivePinKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PIN_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function savePinWrappedKey(
  vaultKey: CryptoKey,
  pin: string,
): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pinKey = await derivePinKey(pin, salt);

  const rawVaultKey = await crypto.subtle.exportKey("raw", vaultKey);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    pinKey,
    rawVaultKey,
  );

  const record: PinWrapRecord = {
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(encrypted)),
    iterations: PIN_ITERATIONS,
  };

  await chrome.storage.local.set({ [PIN_WRAP_KEY]: record });
}

export async function hasPinWrappedKey(): Promise<boolean> {
  const result = await chrome.storage.local.get(PIN_WRAP_KEY);
  return !!result[PIN_WRAP_KEY];
}

export async function unwrapKeyWithPin(pin: string): Promise<CryptoKey> {
  const result = await chrome.storage.local.get(PIN_WRAP_KEY);
  const record = result[PIN_WRAP_KEY] as PinWrapRecord | undefined;

  if (!record) {
    throw new Error("No PIN is configured for this device");
  }

  const salt = fromBase64(record.salt);
  const iv = fromBase64(record.iv);
  const data = fromBase64(record.data);

  const pinKey = await derivePinKey(pin, salt);
  const rawVaultKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    pinKey,
    data as BufferSource,
  );

  return crypto.subtle.importKey(
    "raw",
    rawVaultKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function clearPinWrappedKey(): Promise<void> {
  await chrome.storage.local.remove(PIN_WRAP_KEY);
}

// --- Activity tracking (used by auto-lock) ---

export async function touchActivity(): Promise<void> {
  await chrome.storage.local.set({ [LAST_ACTIVITY_KEY]: Date.now() });
}

export async function getLastActivity(): Promise<number | null> {
  const result = await chrome.storage.local.get(LAST_ACTIVITY_KEY);
  const value = result[LAST_ACTIVITY_KEY] as number | undefined;
  return value ?? null;
}

