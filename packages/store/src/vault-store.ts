import { create } from "zustand";

const AUTO_LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const AUTO_LOCK_CHECK_INTERVAL_MS = 60 * 1000; // check every 60s

interface VaultState {
  masterKey: CryptoKey | null;
  vaultKey: CryptoKey | null;
  privateKey: CryptoKey | null;
  isLocked: boolean;
  lastActivity: number;
  setMasterKey: (masterKey: CryptoKey) => void;
  setVaultKey: (vaultKey: CryptoKey) => void;
  setPrivateKey: (privateKey: CryptoKey) => void;
  getMasterKey: () => CryptoKey | null;
  getVaultKey: () => CryptoKey | null;
  getPrivateKey: () => CryptoKey | null;
  isVaultLocked: () => boolean;
  refreshActivity: () => void;
  clearKeys: () => void;
}

let autoLockTimer: ReturnType<typeof setInterval> | null = null;

function startAutoLockTimer(get: () => VaultState) {
  stopAutoLockTimer();
  autoLockTimer = setInterval(() => {
    const { lastActivity, isLocked, clearKeys } = get();
    if (!isLocked && Date.now() - lastActivity > AUTO_LOCK_TIMEOUT_MS) {
      clearKeys();
    }
  }, AUTO_LOCK_CHECK_INTERVAL_MS);
}

function stopAutoLockTimer() {
  if (autoLockTimer) {
    clearInterval(autoLockTimer);
    autoLockTimer = null;
  }
}

const useVaultStore = create<VaultState>((set, get) => ({
  masterKey: null,
  vaultKey: null,
  privateKey: null,
  isLocked: true,
  lastActivity: Date.now(),

  setMasterKey: (masterKey: CryptoKey) => {
    set({ masterKey, isLocked: false, lastActivity: Date.now() });
    startAutoLockTimer(get);
  },
  setVaultKey: (vaultKey: CryptoKey) => set({ vaultKey }),
  setPrivateKey: (privateKey: CryptoKey) => set({ privateKey }),

  getMasterKey: () => {
    if (!get().masterKey) {
      throw new Error("Session expired - please login again");
    }
    return get().masterKey;
  },
  getVaultKey: () => {
    if (!get().vaultKey) {
      throw new Error("Vault key not available");
    }
    return get().vaultKey;
  },
  getPrivateKey: () => get().privateKey,

  isVaultLocked: () => get().isLocked,

  refreshActivity: () => set({ lastActivity: Date.now() }),

  clearKeys: () => {
    stopAutoLockTimer();
    set({
      masterKey: null,
      vaultKey: null,
      privateKey: null,
      isLocked: true,
    });
  },
}));

export default useVaultStore;
