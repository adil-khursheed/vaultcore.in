import { create } from "zustand";

interface VaultState {
  masterKey: CryptoKey | null;
  vaultKey: CryptoKey | null;
  isLocked: boolean;
  setMasterKey: (masterKey: CryptoKey) => void;
  setVaultKey: (vaultKey: CryptoKey) => void;
  getMasterKey: () => CryptoKey | null;
  getVaultKey: () => CryptoKey | null;
  isVaultLocked: () => boolean;
  clearKeys: () => void;
}

const useVaultStore = create<VaultState>((set, get) => ({
  masterKey: null,
  vaultKey: null,
  isLocked: true,
  setMasterKey: (masterKey: CryptoKey) => set({ masterKey, isLocked: false }),
  setVaultKey: (vaultKey: CryptoKey) => set({ vaultKey }),
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
  isVaultLocked: () => get().isLocked,
  clearKeys: () => set({ masterKey: null, vaultKey: null, isLocked: true }),
}));

export default useVaultStore;
