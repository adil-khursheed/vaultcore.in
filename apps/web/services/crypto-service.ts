class CryptoService {
  private masterKey: CryptoKey | null = null;
  private vaultKey: CryptoKey | null = null;
  private isLocked: boolean = true;

  setMasterKey(key: CryptoKey): void {
    this.masterKey = key;
    this.isLocked = false;
  }

  setVaultKey(key: CryptoKey): void {
    this.vaultKey = key;
  }

  getMasterKey(): CryptoKey {
    if (!this.masterKey) {
      throw new Error("Session expired - please login again");
    }

    return this.masterKey;
  }

  getVaultKey(): CryptoKey {
    if (!this.vaultKey) {
      throw new Error("Vault key not available");
    }

    return this.vaultKey;
  }

  isVaultLocked(): boolean {
    return this.isLocked;
  }

  clearKeys(): void {
    this.masterKey = null;
    this.vaultKey = null;
    this.isLocked = true;
  }
}

export default CryptoService;
