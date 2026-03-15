import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
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

import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import { getActiveOrganizationId } from "@/lib/storage";
import { decryptVaultKey, deriveKeys } from "@/lib/crypto";

interface VaultUnlockScreenProps {
  onUnlock: () => void;
  onLogout: () => void;
  apiBaseUrl: string;
}

const LockFormSchema = z.object({
  password: z.string().min(1, "Please enter your master password"),
});

export function VaultUnlockScreen({
  onUnlock,
  onLogout,
  apiBaseUrl,
}: VaultUnlockScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { setMasterKey, setVaultKey } = useVaultStore();

  const form = useForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: LockFormSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        const authClient = getAuthClient(apiBaseUrl);
        const { data: session } = await authClient.getSession();

        if (!session?.user?.email) {
          throw new Error("User email not found. Please log in again.");
        }

        // 1. Derive master key
        const { masterKey } = await deriveKeys(
          value.password,
          session.user.email
        );

        // 2. Determine organization
        let orgId = await getActiveOrganizationId();
        if (!orgId) {
          const activeOrgId = (session.session as Record<string, unknown>)
            ?.activeOrganizationId as string | undefined;
          if (activeOrgId) {
            orgId = activeOrgId;
          } else {
            throw new Error("No active organization found.");
          }
        }

        // 3. Fetch encrypted vault key
        const trpc = getTrpcClient(apiBaseUrl);
        const vaultData = await trpc.vault.getVaultKey.query({
          organizationId: orgId,
        });

        if (!vaultData?.vaultKeyData) {
          throw new Error("Failed to retrieve vault key from server.");
        }

        // 4. Decrypt vault key
        const decryptedVaultKey = await decryptVaultKey(
          {
            encryptedKey: vaultData.vaultKeyData.key,
            iv: vaultData.vaultKeyData.iv,
          },
          masterKey
        );

        // 5. Store keys and proceed
        setMasterKey(masterKey);
        setVaultKey(decryptedVaultKey);

        onUnlock();
      } catch (err: unknown) {
        console.error(err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to unlock vault. Check your master password.";
        setError(errorMessage);
      }
    },
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 px-6 pt-12 pb-8">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
          <LockIcon className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-foreground text-xl font-semibold">Vault Locked</h1>
        <p className="text-muted-foreground text-center text-sm">
          Enter your master password to unlock your vault
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-1 flex-col gap-4 px-6">
        {error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-xs">
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <FieldGroup className="gap-4">
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Master Password
                      </FieldLabel>
                    </FieldContent>

                    <InputGroup className="h-11">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your master password"
                        aria-invalid={isInvalid}
                        autoFocus
                      />

                      <InputGroupAddon>
                        <LockIcon className="h-4 w-4" />
                      </InputGroupAddon>
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

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    className="w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="animate-spin h-4 w-4" />
                    ) : (
                      "Unlock Vault"
                    )}
                  </Button>
                );
              }}
            />
          </FieldGroup>
        </form>

        {/* Logout Option */}
        <div className="mt-auto flex items-center justify-center pb-6">
          <Button
            variant="link"
            size="sm"
            type="button"
            onClick={onLogout}
            className="text-xs text-muted-foreground transition-colors"
          >
            Sign in with a different account
          </Button>
        </div>
      </div>
    </div>
  );
}
