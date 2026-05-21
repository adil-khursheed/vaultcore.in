import type { CryptoBackend } from "../types";

/**
 * React Native crypto backend using react-native-quick-crypto.
 * Provides native C++ JSI bindings for SubtleCrypto and getRandomValues.
 *
 * Install: npx expo install react-native-quick-crypto
 */
export function createReactNativeCryptoBackend(): CryptoBackend {
  // react-native-quick-crypto is injected as a global polyfill
  // or available via the React Native module resolver
  const g = globalThis as Record<string, unknown>;
  if (g.crypto && (g.crypto as Crypto).subtle) {
    return g.crypto as CryptoBackend;
  }

  throw new Error(
    "react-native-quick-crypto is required for React Native. " +
      "Install it with: npx expo install react-native-quick-crypto " +
      "and ensure it is set up as a global polyfill.",
  );
}
