import { type CryptoBackend } from "../types";

export const webCryptoBackend: CryptoBackend = {
  get subtle() {
    return globalThis.crypto.subtle;
  },
  getRandomValues(array: Uint8Array): Uint8Array {
    return globalThis.crypto.getRandomValues(array);
  },
};

