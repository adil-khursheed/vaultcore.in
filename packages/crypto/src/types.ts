export interface CryptoBackend {
  subtle: SubtleCrypto;
  getRandomValues(array: Uint8Array): Uint8Array;
}

