import type { CredentialType, TCredential } from "@/lib/types";
import { useEffect, useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getActiveOrganizationId } from "@/lib/storage";
import { useForm } from "@tanstack/react-form";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  RefreshCwIcon,
  SaveIcon,
} from "lucide-react";
import { z } from "zod";

import { encryptString } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";

interface AddCredentialScreenProps {
  onBack: () => void;
  apiBaseUrl: string;
  /** When provided the screen edits an existing (already decrypted) item. */
  credential?: TCredential | null;
  onSaved?: () => void;
}

const CREDENTIAL_TYPES: { label: string; value: CredentialType }[] = [
  { label: "Login", value: "login" },
  { label: "Credit Card", value: "card" },
  { label: "Identity", value: "identity" },
  { label: "Secure Note", value: "note" },
  { label: "SSH Key", value: "ssh_key" },
];

const CARD_BRANDS = [
  { label: "Visa", value: "visa" },
  { label: "Mastercard", value: "mastercard" },
  { label: "American Express", value: "amex" },
  { label: "Discover", value: "discover" },
  { label: "RuPay", value: "rupay" },
  { label: "Maestro", value: "maestro" },
  { label: "Diners Club", value: "diners_club" },
  { label: "JCB", value: "jcb" },
  { label: "Other", value: "other" },
];

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];

const IDENTITY_TITLES = [
  { label: "Mr", value: "mr" },
  { label: "Mrs", value: "mrs" },
  { label: "Ms", value: "ms" },
  { label: "Dr", value: "dr" },
  { label: "Mx", value: "mx" },
];

const CARD_KEYS = [
  "cardholderName",
  "cardNumber",
  "brand",
  "expiryMonth",
  "expiryYear",
  "cvv",
] as const;

const IDENTITY_KEYS = [
  "identityTitle",
  "firstName",
  "middleName",
  "lastName",
  "username",
  "email",
  "phone",
  "company",
  "socialSecurityNumber",
  "passportNumber",
  "licenseNumber",
  "address_1",
  "address_2",
  "addressCity",
  "addressState",
  "addressZip",
  "addressCountry",
] as const;

const SSH_KEYS = ["publicKey", "privateKey", "fingerprint"] as const;

const IDENTITY_TEXT_FIELDS: {
  name: (typeof IDENTITY_KEYS)[number];
  label: string;
  placeholder?: string;
}[] = [
  { name: "firstName", label: "First Name", placeholder: "Ada" },
  { name: "middleName", label: "Middle Name" },
  { name: "lastName", label: "Last Name", placeholder: "Lovelace" },
  { name: "username", label: "Username" },
  { name: "email", label: "Email", placeholder: "ada@example.com" },
  { name: "phone", label: "Phone", placeholder: "+1 555 0100" },
  { name: "company", label: "Company" },
  { name: "socialSecurityNumber", label: "SSN / National ID" },
  { name: "passportNumber", label: "Passport Number" },
  { name: "licenseNumber", label: "License Number" },
  { name: "address_1", label: "Address Line 1" },
  { name: "address_2", label: "Address Line 2" },
  { name: "addressCity", label: "City" },
  { name: "addressState", label: "State / Region" },
  { name: "addressZip", label: "Postal / ZIP Code" },
  { name: "addressCountry", label: "Country" },
];

function generatePassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  const limit = Math.floor(256 / charset.length) * charset.length;
  const bytes = new Uint8Array(length * 2);
  let password = "";
  while (password.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= limit) continue;
      password += charset[byte % charset.length];
      if (password.length === length) break;
    }
  }
  return password;
}

const AddCredentialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  username: z.string(),
  password: z.string(),
  url: z.string(),
  otp: z.string(),
  note: z.string(),
});

function getInitialData(credential?: TCredential | null): Record<string, string> {
  if (!credential?.data || typeof credential.data !== "object") return {};
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(credential.data as Record<string, unknown>)) {
    if (typeof v === "string") result[k] = v;
  }
  return result;
}

export function AddCredentialScreen({
  onBack,
  apiBaseUrl,
  credential,
  onSaved,
}: AddCredentialScreenProps) {
  const isEditing = !!credential;
  const [type, setType] = useState<CredentialType>(credential?.type ?? "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [dataFields, setDataFields] = useState<Record<string, string>>(() =>
    getInitialData(credential),
  );
  const [error, setError] = useState("");

  const { vaultKey } = useVaultStore();

  const setDataField = (key: string, val: string) =>
    setDataFields((prev) => ({ ...prev, [key]: val }));

  const form = useForm({
    defaultValues: {
      title: credential?.title ?? "",
      username: credential?.username ?? "",
      password: credential?.password ?? "",
      url: credential?.url ?? "",
      otp: credential?.otp ?? "",
      note: credential?.note ?? "",
    },
    validators: {
      onSubmit: AddCredentialSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      try {
        const orgId = await getActiveOrganizationId();
        if (!orgId) {
          throw new Error(
            "No organization found. Please set up your vault first.",
          );
        }

        if (!vaultKey) {
          throw new Error("Vault key not found. Please unlock your vault.");
        }

        const encryptedTitle = await encryptString(value.title, vaultKey);
        const encryptedNote = value.note
          ? await encryptString(value.note, vaultKey)
          : undefined;

        let encryptedUsername: string | undefined;
        let encryptedPassword: string | undefined;
        let encryptedUrl: string | undefined;
        let encryptedOtp: string | undefined;
        let encryptedData: Record<string, string> | undefined;

        if (type === "login") {
          encryptedUsername = value.username
            ? await encryptString(value.username, vaultKey)
            : undefined;
          encryptedPassword = value.password
            ? await encryptString(value.password, vaultKey)
            : undefined;
          encryptedUrl = value.url
            ? await encryptString(value.url, vaultKey)
            : undefined;
          encryptedOtp = value.otp
            ? await encryptString(value.otp, vaultKey)
            : undefined;
        } else if (type !== "note") {
          const keys =
            type === "card"
              ? CARD_KEYS
              : type === "identity"
                ? IDENTITY_KEYS
                : SSH_KEYS;
          const nextData: Record<string, string> = {};
          for (const key of keys) {
            const raw = dataFields[key]?.trim();
            if (raw) {
              nextData[key] = await encryptString(raw, vaultKey);
            }
          }
          if (Object.keys(nextData).length > 0) {
            encryptedData = nextData;
          }
        }

        const trpc = getTrpcClient(apiBaseUrl);

        if (credential) {
          await trpc.credential.update.mutate({
            id: credential.id,
            organizationId: orgId,
            title: encryptedTitle,
            type,
            username: encryptedUsername,
            password: encryptedPassword,
            url: encryptedUrl,
            note: encryptedNote,
            otp: encryptedOtp,
            data: encryptedData,
          });
        } else {
          await trpc.credential.create.mutate({
            organizationId: orgId,
            title: encryptedTitle,
            type,
            username: encryptedUsername,
            password: encryptedPassword,
            url: encryptedUrl,
            note: encryptedNote,
            otp: encryptedOtp,
            data: encryptedData,
          });
        }

        onSaved?.();
        onBack();
      } catch (err: unknown) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to save credential",
        );
      }
    },
  });

  // Pre-fill URL and title from current tab when creating a new login
  useEffect(() => {
    if (credential) return;

    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url && !tabs[0].url.startsWith("chrome")) {
        form.setFieldValue("url", tabs[0].url);

        try {
          const parsed = new URL(tabs[0].url);
          let hostname =
            parsed.hostname.replace("www.", "").split(".")[0] || "";
          if (hostname) {
            hostname = hostname.charAt(0).toUpperCase() + hostname.slice(1);
            form.setFieldValue("title", hostname);
          }
        } catch {
          // ignore parsing errors
        }
      }
    });
  }, [form, credential]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center gap-2 border-b px-3 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground h-8 w-8"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <span className="text-foreground text-sm font-medium">
          {isEditing ? "Edit Credential" : "Add Credential"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-foreground text-xs font-semibold">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {CREDENTIAL_TYPES.map((t) => (
              <Button
                key={t.value}
                type="button"
                variant={type === t.value ? "default" : "secondary"}
                onClick={() => setType(t.value)}
                className="h-7 px-2.5 text-[11px] transition-colors"
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <FieldGroup className="gap-3">
            {/* Title */}
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Title *
                      </FieldLabel>
                    </FieldContent>
                    <InputGroup className="h-9">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="e.g. Google, Personal Card..."
                        aria-invalid={isInvalid}
                      />
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Login fields */}
            {type === "login" && (
              <>
                <form.Field
                  name="username"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          Username / Email
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup className="h-9">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="username or email"
                        />
                      </InputGroup>
                    </Field>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          Password
                        </FieldLabel>
                      </FieldContent>
                      <div className="flex gap-2">
                        <InputGroup className="h-9 flex-1">
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter or generate password"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              size="icon-sm"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {!showPassword ? (
                                <EyeIcon className="h-4 w-4" />
                              ) : (
                                <EyeOffIcon className="h-4 w-4" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground h-9 px-2.5 text-xs"
                          onClick={() => {
                            field.handleChange(generatePassword());
                            setShowPassword(true);
                          }}
                          title="Generate password"
                        >
                          <RefreshCwIcon className="mr-1 h-3.5 w-3.5" />
                          Gen
                        </Button>
                      </div>
                    </Field>
                  )}
                />

                <form.Field
                  name="url"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          Website URL
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup className="h-9">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          type="url"
                          placeholder="https://example.com"
                        />
                      </InputGroup>
                    </Field>
                  )}
                />

                <form.Field
                  name="otp"
                  children={(field) => (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          Authenticator secret (optional)
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup className="h-9">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Base32 secret or otpauth:// URI"
                        />
                      </InputGroup>
                    </Field>
                  )}
                />
              </>
            )}

            {/* Credit Card fields */}
            {type === "card" && (
              <>
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="cardholderName" className="text-xs">
                      Cardholder Name
                    </FieldLabel>
                  </FieldContent>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      id="cardholderName"
                      value={dataFields.cardholderName ?? ""}
                      onChange={(e) =>
                        setDataField("cardholderName", e.target.value)
                      }
                      placeholder="Name on card"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="cardNumber" className="text-xs">
                      Card Number
                    </FieldLabel>
                  </FieldContent>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      id="cardNumber"
                      value={dataFields.cardNumber ?? ""}
                      onChange={(e) =>
                        setDataField("cardNumber", e.target.value)
                      }
                      placeholder="1234 5678 9012 3456"
                      className="font-mono"
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel className="text-xs">Card Brand</FieldLabel>
                  </FieldContent>
                  <Select
                    value={dataFields.brand ?? ""}
                    onValueChange={(val) => setDataField("brand", val)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_BRANDS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-3 gap-2">
                  <Field>
                    <FieldContent>
                      <FieldLabel className="text-xs">Exp Month</FieldLabel>
                    </FieldContent>
                    <Select
                      value={dataFields.expiryMonth ?? ""}
                      onValueChange={(val) => setDataField("expiryMonth", val)}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="expiryYear" className="text-xs">
                        Exp Year
                      </FieldLabel>
                    </FieldContent>
                    <InputGroup className="h-9">
                      <InputGroupInput
                        id="expiryYear"
                        value={dataFields.expiryYear ?? ""}
                        onChange={(e) =>
                          setDataField("expiryYear", e.target.value)
                        }
                        placeholder="YYYY"
                        maxLength={4}
                        className="font-mono"
                      />
                    </InputGroup>
                  </Field>

                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor="cvv" className="text-xs">
                        CVV
                      </FieldLabel>
                    </FieldContent>
                    <InputGroup className="h-9">
                      <InputGroupInput
                        id="cvv"
                        type={showCvv ? "text" : "password"}
                        value={dataFields.cvv ?? ""}
                        onChange={(e) => setDataField("cvv", e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="font-mono"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                        >
                          {!showCvv ? (
                            <EyeIcon className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOffIcon className="h-3.5 w-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
              </>
            )}

            {/* Identity fields */}
            {type === "identity" && (
              <>
                <Field>
                  <FieldContent>
                    <FieldLabel className="text-xs">Title</FieldLabel>
                  </FieldContent>
                  <Select
                    value={dataFields.identityTitle ?? ""}
                    onValueChange={(val) => setDataField("identityTitle", val)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {IDENTITY_TITLES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {IDENTITY_TEXT_FIELDS.map((f) => (
                  <Field key={f.name}>
                    <FieldContent>
                      <FieldLabel htmlFor={f.name} className="text-xs">
                        {f.label}
                      </FieldLabel>
                    </FieldContent>
                    <InputGroup className="h-9">
                      <InputGroupInput
                        id={f.name}
                        value={dataFields[f.name] ?? ""}
                        onChange={(e) => setDataField(f.name, e.target.value)}
                        placeholder={f.placeholder}
                      />
                    </InputGroup>
                  </Field>
                ))}
              </>
            )}

            {/* SSH Key fields */}
            {type === "ssh_key" && (
              <>
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="publicKey" className="text-xs">
                      Public Key
                    </FieldLabel>
                  </FieldContent>
                  <Textarea
                    id="publicKey"
                    value={dataFields.publicKey ?? ""}
                    onChange={(e) => setDataField("publicKey", e.target.value)}
                    placeholder="ssh-ed25519 AAAA..."
                    rows={3}
                    className="bg-muted/50 resize-none font-mono text-xs"
                  />
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="privateKey" className="text-xs">
                      Private Key
                    </FieldLabel>
                  </FieldContent>
                  <Textarea
                    id="privateKey"
                    value={dataFields.privateKey ?? ""}
                    onChange={(e) => setDataField("privateKey", e.target.value)}
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                    rows={4}
                    className="bg-muted/50 resize-none font-mono text-xs"
                  />
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="fingerprint" className="text-xs">
                      Fingerprint
                    </FieldLabel>
                  </FieldContent>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      id="fingerprint"
                      value={dataFields.fingerprint ?? ""}
                      onChange={(e) =>
                        setDataField("fingerprint", e.target.value)
                      }
                      placeholder="SHA256:..."
                      className="font-mono text-xs"
                    />
                  </InputGroup>
                </Field>
              </>
            )}

            {/* Notes */}
            <form.Field
              name="note"
              children={(field) => (
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name} className="text-xs">
                      Notes
                    </FieldLabel>
                  </FieldContent>
                  <div className="mt-1">
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Add any additional notes..."
                      rows={3}
                      className="bg-muted/50 resize-none text-sm"
                    />
                  </div>
                </Field>
              )}
            />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="mt-4 w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      {isEditing ? "Save Changes" : "Save Credential"}
                    </>
                  )}
                </Button>
              )}
            />
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
