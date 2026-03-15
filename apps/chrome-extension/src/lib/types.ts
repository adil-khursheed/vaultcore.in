// Types shared across popup, background, and content scripts

export type CredentialType = "login" | "card" | "identity" | "note" | "ssh_key";

export type TCredential = {
  id: string;
  organizationId: string;
  title: string;
  username: string | null;
  password: string | null;
  url: string | null;
  note: string | null;
  type: CredentialType;
  data: unknown;
  otp: string | null;
  isFavorite: boolean | null;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

// Message types for extension communication
export type ExtensionMessage =
  | { type: "AUTOFILL"; payload: { username: string; password: string } }
  | { type: "GET_CURRENT_URL" }
  | { type: "CURRENT_URL"; payload: { url: string } }
  | {
      type: "CREDENTIALS_FOR_SITE";
      payload: { count: number; credentials: TCredential[] };
    }
  | { type: "AUTOFILL_SUCCESS" }
  | { type: "AUTOFILL_FAILED"; payload: { reason: string } };
