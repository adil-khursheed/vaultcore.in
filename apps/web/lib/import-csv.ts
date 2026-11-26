import { encryptString } from "@repo/crypto";

export type ImportSource =
  | "vaultcore"
  | "bitwarden"
  | "onepassword"
  | "apple"
  | "proton"
  | "lastpass"
  | "nordpass"
  | "dashlane"
  | "chrome"
  | "firefox"
  | "keepassxc";

export type CredentialType = "login" | "card" | "identity" | "note" | "ssh_key";

export interface ImportSourceMeta {
  id: ImportSource;
  label: string;
  expectedColumns: string;
}

export const IMPORT_SOURCES: ImportSourceMeta[] = [
  {
    id: "vaultcore",
    label: "VaultCore",
    expectedColumns: "title, url, user_name, password, note, category, otp, extra_json",
  },
  {
    id: "bitwarden",
    label: "Bitwarden",
    expectedColumns:
      "folder, favorite, type, name, notes, fields, reprompt, login_uri, login_username, login_password, login_totp",
  },
  {
    id: "onepassword",
    label: "1Password",
    expectedColumns: "Title, Url, Username, Password, OTPAuth, Favorite, Archived, Tags, Notes",
  },
  {
    id: "apple",
    label: "Apple Passwords",
    expectedColumns: "Title, URL, Username, Password, Notes, OTPAuth",
  },
  {
    id: "proton",
    label: "Proton Pass",
    expectedColumns: "name, url, email, username, password, note, totp, vault",
  },
  {
    id: "lastpass",
    label: "LastPass",
    expectedColumns: "url, username, password, extra, name, grouping, fav, totp",
  },
  {
    id: "nordpass",
    label: "NordPass",
    expectedColumns:
      "name, url, username, password, note, cardholdername, cardnumber, cvc, expirydate, zipcode, folder, full_name, phone_number, email, address1, address2, city, country, state",
  },
  {
    id: "dashlane",
    label: "Dashlane",
    expectedColumns: "title, url, user_name, user_name_2, user_name_3, password, note, category, otp",
  },
  {
    id: "chrome",
    label: "Chrome / Edge / Brave",
    expectedColumns: "name, url, username, password, note",
  },
  {
    id: "firefox",
    label: "Firefox",
    expectedColumns: "url, username, password, httpRealm, formActionOrigin, guid, timeCreated, timeLastUsed, timePasswordChanged",
  },
  {
    id: "keepassxc",
    label: "KeePassXC",
    expectedColumns: "Group, Title, Username, Password, URL, Notes",
  },
];

type RawRow = Record<string, string | undefined>;

interface NormalizedRow {
  title: string;
  type: CredentialType;
  username?: string;
  password?: string;
  url?: string;
  note?: string;
  otp?: string;
  isFavorite?: boolean;
  data?: Record<string, unknown>;
}

function getField(row: RawRow, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function titleFromUrl(url: string, fallback = "Untitled"): string {
  if (!url) return fallback;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url || fallback;
  }
}

function parseBool(value: string): boolean | undefined {
  const v = value.toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return undefined;
}

function mapCategory(cat: string): CredentialType {
  const lower = cat.toLowerCase();
  if (lower.includes("card")) return "card";
  if (lower.includes("identity") || lower.includes("personal")) return "identity";
  if (lower.includes("note")) return "note";
  if (lower.includes("ssh") || lower.includes("key")) return "ssh_key";
  return "login";
}

function parseExpiry(raw: string): { expiryMonth?: string; expiryYear?: string } {
  const match = raw.match(/(\d{1,2})\s*[/-]\s*(\d{2,4})/);
  if (!match) return {};
  const monthNum = Number(match[1]);
  const expiryMonth =
    monthNum >= 1 && monthNum <= 12 ? String(monthNum).padStart(2, "0") : undefined;
  const rawYear = match[2] ?? "";
  const expiryYear = rawYear.length === 2 ? `20${rawYear}` : rawYear || undefined;
  return { expiryMonth, expiryYear };
}

function normalizeRow(row: RawRow, source: ImportSource): NormalizedRow {
  switch (source) {
    case "vaultcore": {
      const url = getField(row, "url");
      let data: Record<string, unknown> | undefined;
      const extraRaw = getField(row, "extra_json");
      if (extraRaw) {
        try {
          const parsed = JSON.parse(extraRaw) as unknown;
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            data = parsed as Record<string, unknown>;
          }
        } catch {
          // Ignore malformed extra_json
        }
      }
      return {
        title: getField(row, "title") || titleFromUrl(url),
        type: mapCategory(getField(row, "category")),
        username: getField(row, "user_name", "username") || undefined,
        password: getField(row, "password") || undefined,
        url: url || undefined,
        note: getField(row, "note") || undefined,
        otp: getField(row, "otp") || undefined,
        data,
      };
    }

    case "bitwarden": {
      const url = getField(row, "login_uri");
      const rawType = getField(row, "type").toLowerCase();
      return {
        title: getField(row, "name") || titleFromUrl(url),
        type: rawType === "note" ? "note" : "login",
        username: getField(row, "login_username") || undefined,
        password: getField(row, "login_password") || undefined,
        url: url || undefined,
        note: getField(row, "notes") || undefined,
        otp: getField(row, "login_totp") || undefined,
        isFavorite: parseBool(getField(row, "favorite")),
      };
    }

    case "onepassword": {
      const url = getField(row, "Url", "URL", "url");
      return {
        title: getField(row, "Title", "title") || titleFromUrl(url),
        type: "login",
        username: getField(row, "Username", "username") || undefined,
        password: getField(row, "Password", "password") || undefined,
        url: url || undefined,
        note: getField(row, "Notes", "notes") || undefined,
        otp: getField(row, "OTPAuth", "otpauth") || undefined,
        isFavorite: parseBool(getField(row, "Favorite", "favorite")),
      };
    }

    case "apple": {
      const url = getField(row, "URL", "Url", "url");
      return {
        title: getField(row, "Title", "title") || titleFromUrl(url),
        type: "login",
        username: getField(row, "Username", "username") || undefined,
        password: getField(row, "Password", "password") || undefined,
        url: url || undefined,
        note: getField(row, "Notes", "notes") || undefined,
        otp: getField(row, "OTPAuth", "otpauth") || undefined,
      };
    }

    case "proton": {
      const url = getField(row, "url");
      const rawType = getField(row, "type").toLowerCase();
      return {
        title: getField(row, "name") || titleFromUrl(url),
        type: rawType === "note" ? "note" : "login",
        username: getField(row, "username", "email") || undefined,
        password: getField(row, "password") || undefined,
        url: url || undefined,
        note: getField(row, "note") || undefined,
        otp: getField(row, "totp") || undefined,
      };
    }

    case "lastpass": {
      const url = getField(row, "url");
      const username = getField(row, "username");
      const password = getField(row, "password");
      const isNote = !url && !username && !password;
      return {
        title: getField(row, "name") || titleFromUrl(url),
        type: isNote ? "note" : "login",
        username: username || undefined,
        password: password || undefined,
        url: url || undefined,
        note: getField(row, "extra") || undefined,
        otp: getField(row, "totp") || undefined,
        isFavorite: parseBool(getField(row, "fav")),
      };
    }

    case "nordpass": {
      const url = getField(row, "url");
      const cardNumber = getField(row, "cardnumber");
      const fullName = getField(row, "full_name");
      const email = getField(row, "email");
      const phone = getField(row, "phone_number");
      const address1 = getField(row, "address1");
      const title = getField(row, "name") || titleFromUrl(url);
      const note = getField(row, "note") || undefined;

      if (cardNumber) {
        const { expiryMonth, expiryYear } = parseExpiry(getField(row, "expirydate"));
        return {
          title,
          type: "card",
          note,
          data: {
            cardholderName: getField(row, "cardholdername") || undefined,
            cardNumber,
            cvv: getField(row, "cvc") || undefined,
            expiryMonth,
            expiryYear,
          },
        };
      }

      if (fullName || address1 || phone) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        return {
          title,
          type: "identity",
          note,
          data: {
            firstName: parts[0] || undefined,
            lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
            email: email || undefined,
            phone: phone || undefined,
            address_1: address1 || undefined,
            address_2: getField(row, "address2") || undefined,
            addressCity: getField(row, "city") || undefined,
            addressState: getField(row, "state") || undefined,
            addressZip: getField(row, "zipcode") || undefined,
            addressCountry: getField(row, "country") || undefined,
          },
        };
      }

      const username = getField(row, "username", "email");
      const password = getField(row, "password");
      const isNote = !url && !username && !password;
      return {
        title,
        type: isNote ? "note" : "login",
        username: username || undefined,
        password: password || undefined,
        url: url || undefined,
        note,
      };
    }

    case "dashlane": {
      const url = getField(row, "url");
      return {
        title: getField(row, "title") || titleFromUrl(url),
        type: mapCategory(getField(row, "category")),
        username: getField(row, "user_name", "user_name_2", "user_name_3", "username") || undefined,
        password: getField(row, "password") || undefined,
        url: url || undefined,
        note: getField(row, "note") || undefined,
        otp: getField(row, "otp", "otpSecret") || undefined,
      };
    }

    case "chrome": {
      const url = getField(row, "url");
      return {
        title: getField(row, "name") || titleFromUrl(url),
        type: "login",
        username: getField(row, "username") || undefined,
        password: getField(row, "password") || undefined,
        url: url || undefined,
        note: getField(row, "note") || undefined,
      };
    }

    case "firefox": {
      const url = getField(row, "url");
      return {
        title: titleFromUrl(url),
        type: "login",
        username: getField(row, "username") || undefined,
        password: getField(row, "password") || undefined,
        url: url || undefined,
      };
    }

    case "keepassxc": {
      const url = getField(row, "URL", "url");
      return {
        title: getField(row, "Title", "title") || titleFromUrl(url),
        type: "login",
        username: getField(row, "Username", "username") || undefined,
        password: getField(row, "Password", "password") || undefined,
        url: url || undefined,
        note: getField(row, "Notes", "notes") || undefined,
        otp: getField(row, "TOTP", "totp") || undefined,
      };
    }
  }
}

async function encryptDataFields(
  data: Record<string, unknown> | undefined,
  vaultKey: CryptoKey,
): Promise<Record<string, unknown> | undefined> {
  if (!data) return undefined;

  const encrypted: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null || val === "") continue;
    encrypted[key] = typeof val === "string" ? await encryptString(val, vaultKey) : val;
  }

  return Object.keys(encrypted).length > 0 ? encrypted : undefined;
}

export async function prepareEncryptedImportItems(
  rows: RawRow[],
  source: ImportSource,
  vaultKey: CryptoKey,
) {
  return Promise.all(
    rows.map(async (raw) => {
      const item = normalizeRow(raw, source);
      const [title, username, password, url, note, otp, data] = await Promise.all([
        encryptString(item.title || "Untitled", vaultKey),
        item.username !== undefined ? encryptString(item.username, vaultKey) : undefined,
        item.password !== undefined ? encryptString(item.password, vaultKey) : undefined,
        item.url !== undefined ? encryptString(item.url, vaultKey) : undefined,
        item.note !== undefined ? encryptString(item.note, vaultKey) : undefined,
        item.otp !== undefined ? encryptString(item.otp, vaultKey) : undefined,
        encryptDataFields(item.data, vaultKey),
      ]);

      return {
        title,
        username,
        password,
        url,
        note,
        otp,
        type: item.type,
        data,
        isFavorite: item.isFavorite,
      };
    }),
  );
}
