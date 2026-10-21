import { getCryptoBackend } from "./config";
import { fromBase64, toBase64 } from "./encoding";

// --- Key Pair Generation ---

export const generateUserKeyPair = async () => {
  const backend = getCryptoBackend();
  return await backend.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
};

// --- Private Key Encryption/Decryption ---

export const encryptPrivateKey = async (
  privateKey: CryptoKey,
  masterKey: CryptoKey,
) => {
  const backend = getCryptoBackend();
  const iv = backend.getRandomValues(new Uint8Array(12));

  // Export private key to PKCS8 format
  const exportedPrivateKey = await backend.subtle.exportKey(
    "pkcs8",
    privateKey,
  );

  // Encrypt the exported key with AES-GCM using the master key
  const encryptedPrivateKey = await backend.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    masterKey,
    exportedPrivateKey,
  );

  return {
    encryptedPrivateKey: toBase64(new Uint8Array(encryptedPrivateKey)),
    iv: toBase64(iv),
  };
};

export const decryptPrivateKey = async (
  encryptedData: {
    encryptedPrivateKey: string;
    iv: string;
  },
  masterKey: CryptoKey,
) => {
  const backend = getCryptoBackend();
  const encryptedKey = fromBase64(encryptedData.encryptedPrivateKey);
  const iv = fromBase64(encryptedData.iv);

  // Decrypt the private key
  const decryptedPkcs8 = await backend.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    masterKey,
    encryptedKey,
  );

  // Import the decrypted PKCS8 back into a CryptoKey
  return await backend.subtle.importKey(
    "pkcs8",
    decryptedPkcs8,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );
};

// --- Vault Key Wrapping/Unwrapping ---

/**
 * Wraps (encrypts) the AES-GCM vault key using a user's RSA public key.
 */
export const wrapVaultKeyForMember = async (
  vaultKey: CryptoKey,
  memberPublicKeyJWK: JsonWebKey,
) => {
  const backend = getCryptoBackend();

  // Import the member's public key from JWK
  const publicKey = await backend.subtle.importKey(
    "jwk",
    memberPublicKeyJWK,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );

  // Export the AES vault key to raw format so we can encrypt it
  const vaultKeyRaw = await backend.subtle.exportKey("raw", vaultKey);

  // Encrypt the raw vault key with the user's RSA public key
  const wrappedKey = await backend.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    vaultKeyRaw,
  );

  return toBase64(new Uint8Array(wrappedKey));
};

/**
 * Unwraps (decrypts) the AES-GCM vault key using the user's RSA private key.
 */
export const unwrapVaultKeyFromMember = async (
  wrappedVaultKeyBase64: string,
  userPrivateKey: CryptoKey,
) => {
  const backend = getCryptoBackend();

  const wrappedKeyBytes = fromBase64(wrappedVaultKeyBase64);

  // Decrypt the raw vault key using the RSA private key
  const vaultKeyRaw = await backend.subtle.decrypt(
    { name: "RSA-OAEP" },
    userPrivateKey,
    wrappedKeyBytes,
  );

  // Import it back as an AES-GCM CryptoKey
  return await backend.subtle.importKey(
    "raw",
    vaultKeyRaw,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

