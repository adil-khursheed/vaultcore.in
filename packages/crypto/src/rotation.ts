import { generateVaultKey } from "./vault";
import { wrapVaultKeyForMember, unwrapVaultKeyFromMember } from "./rsa";
import { encryptString, decryptString } from "./strings";

export interface RotateVaultKeyParams {
  currentEncryptedVaultKey: string;
  userPrivateKey: CryptoKey;
  activeMembers: {
    userId: string;
    publicKeyJwk: JsonWebKey;
  }[];
  credentials: {
    id: string;
    type: string;
    username?: string | null;
    password?: string | null;
    url?: string | null;
    otp?: string | null;
    note?: string | null;
    data?: Record<string, string> | null;
  }[];
}

/**
 * Client-side vault key rotation service.
 *
 * 1. Unwraps the current vault key using the admin's RSA private key
 * 2. Generates a new AES-256-GCM vault key
 * 3. Re-encrypts all credential fields with the new key
 * 4. Wraps the new key for every active member's RSA public key
 *
 * The server never sees plaintext — zero-knowledge rotation.
 */
export async function rotateVaultKey(params: RotateVaultKeyParams) {
  const {
    currentEncryptedVaultKey,
    userPrivateKey,
    activeMembers,
    credentials,
  } = params;

  // 1. Unwrap the current vault key
  const currentVaultKey = await unwrapVaultKeyFromMember(
    currentEncryptedVaultKey,
    userPrivateKey,
  );

  // 2. Generate a new vault key
  const newVaultKey = await generateVaultKey();

  // 3. Re-encrypt all credential fields
  const reEncryptedCredentials = await Promise.all(
    credentials.map(async (item) => {
      const reEncrypt = async (
        field: string | null | undefined,
      ): Promise<string | null | undefined> => {
        if (!field) return field;
        const decrypted = await decryptString(field, currentVaultKey);
        return await encryptString(decrypted, newVaultKey);
      };

      const newData: Record<string, string> = {};
      if (item.data) {
        for (const [key, val] of Object.entries(item.data)) {
          // Only re-encrypt values that look like encrypted strings (iv:ciphertext)
          if (val && typeof val === "string" && val.includes(":")) {
            newData[key] = (await reEncrypt(val)) as string;
          } else {
            newData[key] = val;
          }
        }
      }

      return {
        id: item.id,
        username: await reEncrypt(item.username),
        password: await reEncrypt(item.password),
        url: await reEncrypt(item.url),
        otp: await reEncrypt(item.otp),
        note: await reEncrypt(item.note),
        data: item.data ? newData : item.data,
      };
    }),
  );

  // 4. Wrap new vault key for all active members
  const newWrappedKeys = await Promise.all(
    activeMembers.map(async (m) => {
      const wrappedKey = await wrapVaultKeyForMember(
        newVaultKey,
        m.publicKeyJwk,
      );
      return {
        userId: m.userId,
        encryptedKey: wrappedKey,
      };
    }),
  );

  return {
    reEncryptedCredentials,
    newWrappedKeys,
    newVaultKey,
  };
}
