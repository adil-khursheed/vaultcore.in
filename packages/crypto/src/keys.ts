import { getCryptoBackend } from "./config";
import { toBase64 } from "./encoding";

export const deriveMasterKey = async (
  masterPassword: string,
  email: string,
) => {
  const backend = getCryptoBackend();
  const salt = new TextEncoder().encode(email);

  const passwordKey = await backend.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  const masterKey = await backend.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  return masterKey;
};

export const derivePasswordHash = async (
  masterKey: CryptoKey,
  masterPassword: string,
) => {
  const backend = getCryptoBackend();
  const masterKeyBytes = await backend.subtle.exportKey("raw", masterKey);

  const hashKey = await backend.subtle.importKey(
    "raw",
    masterKeyBytes,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const hash = await backend.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(masterPassword),
      iterations: 1,
      hash: "SHA-256",
    },
    hashKey,
    256,
  );

  return toBase64(new Uint8Array(hash));
};

export const deriveKeys = async (masterPassword: string, email: string) => {
  const masterKey = await deriveMasterKey(masterPassword, email);
  const passwordHash = await derivePasswordHash(masterKey, masterPassword);

  return { masterKey, passwordHash };
};

