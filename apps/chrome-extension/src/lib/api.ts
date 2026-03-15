import {
  createTRPCClient,
  httpBatchLink,
  type CreateTRPCClient,
} from "@trpc/client";
import SuperJSON from "superjson";

// We define a minimal type-safe interface here instead of importing @repo/api
// because @repo/api depends on server-side packages (drizzle, etc.)
// that cannot be resolved in the Chrome extension environment.

type CredentialType = "login" | "card" | "identity" | "note" | "ssh_key";

interface Credential {
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
}

interface GetCredentialsInput {
  organizationId: string;
  type?: CredentialType;
  search?: string | null;
  isFavorite?: boolean;
  isDeleted?: boolean;
  limit?: number;
  cursor?: string | null;
}

interface GetCredentialsOutput {
  items: Credential[];
  nextCursor: string | undefined;
}

interface CreateCredentialInput {
  title: string;
  username?: string;
  password?: string;
  url?: string;
  note?: string;
  type?: CredentialType;
  data?: Record<string, any>;
  organizationId: string;
  otp?: string;
  isFavorite?: boolean;
}

// Minimal tRPC-compatible client interface
interface VaultCoreAPI {
  credential: {
    getCredentials: {
      query: (input: GetCredentialsInput) => Promise<GetCredentialsOutput>;
    };
    create: {
      mutate: (input: CreateCredentialInput) => Promise<any>;
    };
  };
  vault: {
    getVaultKey: {
      query: (input: {
        organizationId: string;
      }) => Promise<{ vaultKeyData: { key: string; iv: string } }>;
    };
  };
}

let apiClientInstance: VaultCoreAPI | null = null;

export function getTrpcClient(baseUrl: string): VaultCoreAPI {
  if (!apiClientInstance) {
    const client = createTRPCClient({
      links: [
        httpBatchLink({
          transformer: SuperJSON,
          url: `${baseUrl}/api/trpc`,
          headers() {
            return {
              "x-trpc-source": "chrome-extension",
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    });

    // Wrap the untyped client into our typed interface
    apiClientInstance = {
      credential: {
        getCredentials: {
          query: (input: GetCredentialsInput) =>
            (client as any).credential.getCredentials.query(input),
        },
        create: {
          mutate: (input: CreateCredentialInput) =>
            (client as any).credential.create.mutate(input),
        },
      },
      vault: {
        getVaultKey: {
          query: (input: { organizationId: string }) =>
            (client as any).vault.getVaultKey.query(input),
        },
      },
    } as VaultCoreAPI;
  }
  return apiClientInstance;
}

export function resetTrpcClient() {
  apiClientInstance = null;
}
