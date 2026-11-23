import { getCryptoBackend } from "./config";

/**
 * Time-based one-time password (RFC 6238) support.
 *
 * Secrets are stored as Base32 strings (the format every authenticator app
 * exports) or as an `otpauth://totp/...` URI. Codes are generated locally
 * with WebCrypto — the secret never leaves the device.
 */

export type TotpAlgorithm = "SHA-1" | "SHA-256" | "SHA-512";

export interface TotpOptions {
  digits?: number;
  period?: number;
  algorithm?: TotpAlgorithm;
}

export interface TotpConfig extends Required<TotpOptions> {
  secret: string;
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const ALGORITHM_NAMES: Record<string, TotpAlgorithm> = {
  SHA1: "SHA-1",
  "SHA-1": "SHA-1",
  SHA256: "SHA-256",
  "SHA-256": "SHA-256",
  SHA512: "SHA-512",
  "SHA-512": "SHA-512",
};

function normalizeBase32(input: string): string {
  return input.replace(/[\s-]/g, "").replace(/=+$/, "").toUpperCase();
}

/**
 * Decode a Base32 string into raw bytes. Throws on characters outside the
 * Base32 alphabet so callers can distinguish a real secret from random text.
 */
export function base32Decode(input: string): Uint8Array {
  const cleaned = normalizeBase32(input);
  if (!cleaned) {
    throw new Error("TOTP secret is empty");
  }

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base32 character "${char}" in TOTP secret`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }

  if (output.length === 0) {
    throw new Error("TOTP secret is too short");
  }

  return new Uint8Array(output);
}

/**
 * Parse either a bare Base32 secret or an `otpauth://totp/...` URI.
 * Bare secrets use the standard defaults (6 digits, 30 seconds, SHA-1).
 */
export function parseTotpSecret(input: string): TotpConfig {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("TOTP secret is empty");
  }

  if (!trimmed.toLowerCase().startsWith("otpauth://")) {
    // Validate the secret early so the UI can fall back to showing raw text.
    base32Decode(trimmed);
    return {
      secret: trimmed,
      digits: 6,
      period: 30,
      algorithm: "SHA-1",
    };
  }

  const url = new URL(trimmed);
  if (url.host.toLowerCase() !== "totp") {
    throw new Error("Only TOTP authenticator URIs are supported");
  }

  const secret = url.searchParams.get("secret");
  if (!secret) {
    throw new Error("Authenticator URI is missing its secret");
  }

  const digits = Number(url.searchParams.get("digits") ?? 6);
  const period = Number(url.searchParams.get("period") ?? 30);
  const algorithmName = (
    url.searchParams.get("algorithm") ?? "SHA1"
  ).toUpperCase();
  const algorithm = ALGORITHM_NAMES[algorithmName];

  if (!Number.isInteger(digits) || digits < 6 || digits > 10) {
    throw new Error("Authenticator URI has an invalid digit count");
  }
  if (!Number.isFinite(period) || period <= 0) {
    throw new Error("Authenticator URI has an invalid period");
  }
  if (!algorithm) {
    throw new Error("Authenticator URI uses an unsupported algorithm");
  }

  base32Decode(secret);

  return { secret, digits, period, algorithm };
}

/**
 * Seconds left before the current code expires.
 */
export function getTotpRemainingSeconds(
  period: number,
  timestamp = Date.now(),
): number {
  const seconds = Math.floor(timestamp / 1000);
  const elapsed = seconds % period;
  return elapsed === 0 ? period : period - elapsed;
}

async function generateHotp(
  config: TotpConfig,
  counter: number,
): Promise<string> {
  const backend = getCryptoBackend();
  const keyBytes = base32Decode(config.secret);

  const key = await backend.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: config.algorithm },
    false,
    ["sign"],
  );

  // RFC 4226 uses an 8-byte big-endian counter.
  const counterBytes = new Uint8Array(8);
  let remaining = BigInt(counter);
  for (let i = 7; i >= 0; i -= 1) {
    counterBytes[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }

  const signature = new Uint8Array(
    await backend.subtle.sign("HMAC", key, counterBytes as BufferSource),
  );

  // Dynamic truncation (RFC 4226 §5.3).
  const offset = (signature[signature.length - 1] ?? 0) & 0x0f;
  const binary =
    (((signature[offset] ?? 0) & 0x7f) << 24) |
    (((signature[offset + 1] ?? 0) & 0xff) << 16) |
    (((signature[offset + 2] ?? 0) & 0xff) << 8) |
    ((signature[offset + 3] ?? 0) & 0xff);

  const code = binary % 10 ** config.digits;
  return code.toString().padStart(config.digits, "0");
}

/**
 * Generate the code for the current time slice.
 */
export async function generateTotp(
  config: TotpConfig,
  timestamp = Date.now(),
): Promise<string> {
  const counter = Math.floor(timestamp / 1000 / config.period);
  return generateHotp(config, counter);
}
