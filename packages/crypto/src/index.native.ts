/**
 * React Native entry point for @repo/crypto.
 * Auto-initializes with the React Native backend (react-native-quick-crypto).
 */
export * from "./types";
export * from "./config";
export * from "./encoding";
export * from "./fingerprint";
export * from "./password-strength";
export * from "./keys";
export * from "./strings";
export * from "./vault";
export * from "./rsa";
export * from "./rotation";

// Auto-initialize with React Native backend
import { setCryptoBackend } from "./config";
import { createReactNativeCryptoBackend } from "./backend/react-native";

setCryptoBackend(createReactNativeCryptoBackend());
