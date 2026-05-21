import { getCryptoBackend } from "./config";
import { fromBase64, toBase64 } from "./encoding";

/**
 * Encrypt a plaintext string using AES-GCM with the provided key.
 * Returns the format: `${ivBase64}:${ciphertextBase64}`
 */
export const encryptString = async (text: string, key: CryptoKey) => {
  const backend = getCryptoBackend();
  const iv = backend.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encrypted = await backend.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encodedText,
  );

  const ivBase64 = toBase64(iv);
  const encryptedBase64 = toBase64(new Uint8Array(encrypted));

  return `${ivBase64}:${encryptedBase64}`;
};

/**
 * Decrypt a string previously encrypted with `encryptString`.
 * Throws an error if decryption fails — callers must handle the error
 * to avoid displaying ciphertext as plaintext (SEC-7).
 *
 * @throws {Error} If the input is malformed or decryption fails
 */
export const decryptString = async (encryptedText: string, key: CryptoKey) => {
  if (!encryptedText) return "";

  const [ivBase64, encryptedBase64] = encryptedText.split(":");
  if (!ivBase64 || !encryptedBase64) {
    throw new Error(
      "Invalid encrypted string format: expected 'iv:ciphertext'",
    );
  }

  const backend = getCryptoBackend();
  const iv = fromBase64(ivBase64);
  const encrypted = fromBase64(encryptedBase64);

  const decrypted = await backend.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
};
