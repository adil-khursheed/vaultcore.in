export const deriveMasterKey = async (
  masterPassword: string,
  email: string
) => {
  const salt = new TextEncoder().encode(email);

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const masterKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return masterKey;
};

export const derivePasswordHash = async (
  masterKey: CryptoKey,
  masterPassword: string
) => {
  const masterKeyBytes = await crypto.subtle.exportKey("raw", masterKey);

  const hashKey = await crypto.subtle.importKey(
    "raw",
    masterKeyBytes,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(masterPassword),
      iterations: 1,
      hash: "SHA-256",
    },
    hashKey,
    256
  );

  return btoa(String.fromCharCode(...new Uint8Array(hash)));
};

export const deriveKeys = async (masterPassword: string, email: string) => {
  const masterKey = await deriveMasterKey(masterPassword, email);
  const passwordHash = await derivePasswordHash(masterKey, masterPassword);
  return { masterKey, passwordHash };
};

export const generateVaultKey = async () => {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptVaultKey = async (
  vaultKey: CryptoKey,
  masterKey: CryptoKey
) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const vaultKeyRaw = await crypto.subtle.exportKey("raw", vaultKey);

  const encryptedVaultKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    masterKey,
    vaultKeyRaw
  );

  return {
    encryptedKey: btoa(
      String.fromCharCode(...new Uint8Array(encryptedVaultKey))
    ),
    iv: btoa(String.fromCharCode(...iv)),
  };
};

export const decryptVaultKey = async (
  encryptedData: {
    encryptedKey: string;
    iv: string;
  },
  masterKey: CryptoKey
) => {
  const encryptedKey = Uint8Array.from(atob(encryptedData.encryptedKey), (c) =>
    c.charCodeAt(0)
  );
  const iv = Uint8Array.from(atob(encryptedData.iv), (c) => c.charCodeAt(0));

  const vaultKeyRaw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    masterKey,
    encryptedKey
  );

  return await crypto.subtle.importKey("raw", vaultKeyRaw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
};

export const encryptString = async (text: string, key: CryptoKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  );

  return `${ivBase64}:${encryptedBase64}`;
};

export const decryptString = async (encryptedText: string, key: CryptoKey) => {
  if (!encryptedText) return "";
  const [ivBase64, encryptedBase64] = encryptedText.split(":");
  if (!ivBase64 || !encryptedBase64) return encryptedText; // Probably not encrypted

  try {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Failed to decrypt string:", error);
    return encryptedText;
  }
};
