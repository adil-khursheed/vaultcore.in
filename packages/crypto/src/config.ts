import { webCryptoBackend } from "./backend/web";
import { type CryptoBackend } from "./types";

// In the future for React Native, we can swap this via environmental checks or package exports
// For now, it defaults to webCryptoBackend
let currentBackend: CryptoBackend = webCryptoBackend;

export function getCryptoBackend(): CryptoBackend {
  return currentBackend;
}

export function setCryptoBackend(backend: CryptoBackend) {
  currentBackend = backend;
}

