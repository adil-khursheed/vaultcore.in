import { create } from "zustand";

type TCredential = {
  url: string | null;
  id: string;
  password: string | null;
  type: "identity" | "login" | "card" | "note" | "ssh_key";
  createdAt: Date;
  updatedAt: Date;
  data: unknown;
  organizationId: string;
  note: string | null;
  title: string;
  username: string | null;
  otp: string | null;
  isFavorite: boolean | null;
  isDeleted: boolean | null;
};

interface CredentialStore {
  selectedCredential: TCredential | null;
  setSelectedCredential: (credential: TCredential | null) => void;
}

const useCredentialStore = create<CredentialStore>((set) => ({
  selectedCredential: null,
  setSelectedCredential: (credential) =>
    set({ selectedCredential: credential }),
}));

export default useCredentialStore;
