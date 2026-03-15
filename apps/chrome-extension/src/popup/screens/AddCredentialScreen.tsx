import { useState, useEffect } from "react";
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon, RefreshCwIcon, Loader2Icon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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
import { Textarea } from "@repo/ui/components/textarea";

import { getTrpcClient } from "@/lib/api";
import { getActiveOrganizationId } from "@/lib/storage";
import { encryptString } from "@/lib/crypto";
import type { CredentialType } from "@/lib/types";

interface AddCredentialScreenProps {
  onBack: () => void;
  apiBaseUrl: string;
}

const CREDENTIAL_TYPES: { label: string; value: CredentialType }[] = [
  { label: "Login", value: "login" },
  { label: "Credit Card", value: "card" },
  { label: "Identity", value: "identity" },
  { label: "Secure Note", value: "note" },
  { label: "SSH Key", value: "ssh_key" },
];

function generatePassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

const AddCredentialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  username: z.string(),
  password: z.string(),
  url: z.string(),
  note: z.string(),
});

export function AddCredentialScreen({
  onBack,
  apiBaseUrl,
}: AddCredentialScreenProps) {
  const [type, setType] = useState<CredentialType>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const { vaultKey } = useVaultStore();

  const form = useForm({
    defaultValues: {
      title: "",
      username: "",
      password: "",
      url: "",
      note: "",
    },
    validators: {
      onSubmit: AddCredentialSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      try {
        const orgId = await getActiveOrganizationId();
        if (!orgId) {
          throw new Error("No organization found. Please set up your vault first.");
        }

        if (!vaultKey) {
          throw new Error("Vault key not found. Please unlock your vault.");
        }

        // Encrypt sensitive fields before saving
        const encryptedUsername = value.username 
          ? await encryptString(value.username, vaultKey) 
          : undefined;
          
        const encryptedPassword = value.password 
          ? await encryptString(value.password, vaultKey) 
          : undefined;
          
        const encryptedUrl = value.url 
          ? await encryptString(value.url, vaultKey) 
          : undefined;
          
        const encryptedNote = value.note 
          ? await encryptString(value.note, vaultKey) 
          : undefined;

        const trpc = getTrpcClient(apiBaseUrl);
        await trpc.credential.create.mutate({
          organizationId: orgId,
          title: value.title,
          type,
          username: encryptedUsername,
          password: encryptedPassword,
          url: encryptedUrl,
          note: encryptedNote,
        });

        onBack();
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Failed to save credential";
        setError(errorMessage);
      }
    },
  });

  // Pre-fill URL and title from current tab
  useEffect(() => {
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url && !tabs[0].url.startsWith("chrome")) {
        form.setFieldValue("url", tabs[0].url);
        
        try {
          const parsed = new URL(tabs[0].url);
          let hostname = parsed.hostname.replace("www.", "").split(".")[0] || "";
          if (hostname) {
            hostname = hostname.charAt(0).toUpperCase() + hostname.slice(1);
            form.setFieldValue("title", hostname);
          }
        } catch {
          // ignore parsing errors
        }
      }
    });
  }, [form]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 text-muted-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-foreground">
          Add Credential
        </span>
      </div>

      {/* Form Area */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-xs">
            {error}
          </div>
        )}

        {/* Type selector */}
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
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name} className="text-xs">Title *</FieldLabel>
                    </FieldContent>
                    <InputGroup className="h-10">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="e.g. Google, GitHub..."
                        aria-invalid={isInvalid}
                      />
                    </InputGroup>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            {/* Username */}
            {(type === "login" || type === "identity") && (
              <form.Field
                name="username"
                children={(field) => {
                  return (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">
                          {type === "identity" ? "Name" : "Username / Email"}
                        </FieldLabel>
                      </FieldContent>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={type === "identity" ? "Full name" : "username or email"}
                        />
                      </InputGroup>
                    </Field>
                  );
                }}
              />
            )}

            {/* Password */}
            {type === "login" && (
              <form.Field
                name="password"
                children={(field) => {
                  return (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">Password</FieldLabel>
                      </FieldContent>
                      <div className="flex gap-2">
                        <InputGroup className="h-10 flex-1">
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
                          className="h-10 px-2.5 text-xs text-muted-foreground"
                          onClick={() => {
                            field.handleChange(generatePassword());
                            setShowPassword(true);
                          }}
                          title="Generate password"
                        >
                          <RefreshCwIcon className="h-3.5 w-3.5 mr-1" />
                          Gen
                        </Button>
                      </div>
                    </Field>
                  );
                }}
              />
            )}

            {/* URL */}
            {type === "login" && (
              <form.Field
                name="url"
                children={(field) => {
                  return (
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name} className="text-xs">Website URL</FieldLabel>
                      </FieldContent>
                      <InputGroup className="h-10">
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
                  );
                }}
              />
            )}

            {/* Notes */}
            <form.Field
              name="note"
              children={(field) => {
                return (
                  <Field>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name} className="text-xs">Notes</FieldLabel>
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
                        className="resize-none text-sm bg-muted/50"
                      />
                    </div>
                  </Field>
                );
              }}
            />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => {
                return (
                  <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <SaveIcon className="mr-2 h-4 w-4" />
                        Save Credential
                      </>
                    )}
                  </Button>
                );
              }}
            />
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
