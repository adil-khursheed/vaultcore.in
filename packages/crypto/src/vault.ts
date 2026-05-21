import { getCryptoBackend } from "./config";
import { fromBase64, toBase64 } from "./encoding";

/**
 * Generate a new AES-256-GCM vault key for an organization.
 */
export const generateVaultKey = async () => {
  const backend = getCryptoBackend();
  return await backend.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

/**
 * @deprecated Legacy AES-GCM vault key encryption. Use RSA-OAEP wrapping via
 * `wrapVaultKeyForMember` for new vault keys. Kept only for migration of
 * pre-RSA vault keys.
 */
export const encryptVaultKey = async (
  vaultKey: CryptoKey,
  masterKey: CryptoKey,
) => {
  const backend = getCryptoBackend();
  const iv = backend.getRandomValues(new Uint8Array(12));
  const vaultKeyRaw = await backend.subtle.exportKey("raw", vaultKey);

  const encryptedVaultKey = await backend.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    masterKey,
    vaultKeyRaw,
  );

  return {
    encryptedKey: toBase64(new Uint8Array(encryptedVaultKey)),
    iv: toBase64(iv),
  };
};

/**
 * @deprecated Legacy AES-GCM vault key decryption. Use RSA-OAEP unwrapping via
 * `unwrapVaultKeyFromMember` for current vault keys. Kept only for migration of
 * pre-RSA vault keys.
 */
export const decryptVaultKey = async (
  encryptedData: {
    encryptedKey: string;
    iv: string;
  },
  masterKey: CryptoKey,
) => {
  const backend = getCryptoBackend();
  const encryptedKey = fromBase64(encryptedData.encryptedKey);
  const iv = fromBase64(encryptedData.iv);

  const vaultKeyRaw = await backend.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    masterKey,
    encryptedKey,
  );

  return await backend.subtle.importKey("raw", vaultKeyRaw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
};
