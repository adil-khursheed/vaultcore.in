import type { CryptoBackend } from "../types";

/**
 * Node.js crypto backend for Electron/server-side usage.
 * Uses the built-in crypto.webcrypto API (Node 15+).
 */
export function createNodeCryptoBackend(): CryptoBackend {
  // Node 19+ and modern runtimes have globalThis.crypto
  const g = globalThis as Record<string, unknown>;
  if (g.crypto && (g.crypto as Crypto).subtle) {
    return g.crypto as CryptoBackend;
  }

  throw new Error(
    "Node.js crypto.webcrypto is not available. " +
      "Requires Node 15+ or a runtime with globalThis.crypto support.",
  );
}
