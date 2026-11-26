import Papa from "papaparse";

import { decryptStringOrPlaintext } from "@repo/crypto";

export interface ExportableCredential {
  title: string;
  type: "login" | "card" | "identity" | "note" | "ssh_key";
  username: string | null;
  password: string | null;
  url: string | null;
  note: string | null;
  otp: string | null;
  data: unknown;
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function sanitizeCsvCell(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

async function safeDecrypt(
  value: string | null | undefined,
  vaultKey: CryptoKey,
): Promise<string> {
  if (!value) return "";
  try {
    return await decryptStringOrPlaintext(value, vaultKey);
  } catch {
    return "";
  }
}

async function decryptDataFields(
  data: unknown,
  vaultKey: CryptoKey,
): Promise<string> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";

  const decrypted: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    decrypted[key] =
      typeof val === "string" ? await safeDecrypt(val, vaultKey) : val;
  }

  return Object.keys(decrypted).length > 0 ? JSON.stringify(decrypted) : "";
}

export async function buildVaultCsv(
  items: ExportableCredential[],
  vaultKey: CryptoKey,
): Promise<string> {
  const rows = await Promise.all(
    items.map(async (item) => {
      const [title, url, userName, password, note, otp, extraJson] =
        await Promise.all([
          safeDecrypt(item.title, vaultKey),
          safeDecrypt(item.url, vaultKey),
          safeDecrypt(item.username, vaultKey),
          safeDecrypt(item.password, vaultKey),
          safeDecrypt(item.note, vaultKey),
          safeDecrypt(item.otp, vaultKey),
          decryptDataFields(item.data, vaultKey),
        ]);

      return {
        title: sanitizeCsvCell(title),
        url: sanitizeCsvCell(url),
        user_name: sanitizeCsvCell(userName),
        password: sanitizeCsvCell(password),
        note: sanitizeCsvCell(note),
        category: item.type,
        otp: sanitizeCsvCell(otp),
        extra_json: sanitizeCsvCell(extraJson),
      };
    }),
  );

  return Papa.unparse(rows);
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
