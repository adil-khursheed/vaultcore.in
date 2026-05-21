import { getCryptoBackend } from "./config";

/**
 * Computes a deterministic SHA-256 fingerprint of an RSA public key.
 *
 * The JWK is canonicalized (keys sorted) before hashing to ensure
 * the same key always produces the same fingerprint regardless of
 * property ordering across platforms and serialization methods.
 *
 * Returns format: "A4F2 8B3C 91D7 E5A0 C6B1 0F7D 3E82 49A5"
 * (first 128 bits of SHA-256 = 32 hex chars in 8 groups of 4)
 *
 * This is the same verification model used by Signal ("Safety Numbers")
 * and enables out-of-band key verification to protect against
 * server-side key substitution attacks.
 */
export async function computeKeyFingerprint(
  publicKeyJwk: JsonWebKey,
): Promise<string> {
  const backend = getCryptoBackend();

  // Canonicalize: sort keys deterministically to ensure consistent output
  const sortedKeys = Object.keys(publicKeyJwk).sort();
  const canonical = JSON.stringify(publicKeyJwk, sortedKeys);
  const raw = new TextEncoder().encode(canonical);
  const hash = await backend.subtle.digest("SHA-256", raw);

  return Array.from(new Uint8Array(hash))
    .slice(0, 16) // first 128 bits — enough for human-verifiable uniqueness
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("")
    .match(/.{4}/g)!
    .join(" ");
}

/**
 * Verifies that a fingerprint matches a public key.
 * Used for programmatic verification during key operations.
 */
export async function verifyKeyFingerprint(
  publicKeyJwk: JsonWebKey,
  expectedFingerprint: string,
): Promise<boolean> {
  const computed = await computeKeyFingerprint(publicKeyJwk);
  return computed === expectedFingerprint;
}
