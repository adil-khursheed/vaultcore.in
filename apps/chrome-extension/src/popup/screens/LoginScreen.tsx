import { useState } from "react";
import { getTrpcClient } from "@/lib/api";
import { getAuthClient } from "@/lib/auth";
import { decryptVaultKey, deriveKeys } from "@/lib/crypto";
import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Loader2Icon, LogInIcon } from "lucide-react";
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

import Logo from "../components/Logo";

interface LoginScreenProps {
  onLogin: () => void;
  apiBaseUrl: string;
}

const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your master password"),
});

export function LoginScreen({ onLogin, apiBaseUrl }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { setMasterKey, setVaultKey } = useVaultStore();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginFormSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");
      // try {
      //   const authClient = getAuthClient(apiBaseUrl);
      //   const result = await authClient.signIn.email({
      //     email: value.email,
      //     password: value.password,
      //   });

      //   if (result.error) {
      //     setError(result.error.message || "Invalid credentials");
      //     return;
      //   }

      //   onLogin();
      // } catch (err: unknown) {
      //   const errorMessage =
      //     err instanceof Error
      //       ? err.message
      //       : "Something went wrong. Please try again.";
      //   setError(errorMessage);
      // }

      const { masterKey, passwordHash } = await deriveKeys(
        value.password,
        value.email,
      );

      const authClient = getAuthClient(apiBaseUrl);

      await authClient.signIn.email(
        {
          email: value.email,
          password: passwordHash,
        },
        {
          onSuccess: async (ctx) => {
            await authClient.organization.setActive(
              {
                organizationSlug: ctx.data.user.id,
              },
              {
                onSuccess: async (ctx) => {
                  const trpc = getTrpcClient(apiBaseUrl);

                  const vaultData = await trpc.vault.getVaultKey.query({
                    organizationId: ctx.data.id,
                  });

                  if (!vaultData?.vaultKeyData) {
                    throw new Error(
                      "Failed to retrieve vault key from server.",
                    );
                  }

                  const decryptedVaultKey = await decryptVaultKey(
                    {
                      encryptedKey: vaultData.vaultKeyData.key,
                      iv: vaultData.vaultKeyData.iv,
                    },
                    masterKey,
                  );

                  setMasterKey(masterKey);
                  setVaultKey(decryptedVaultKey);

                  onLogin();
                },
                onError: (ctx) => {
                  console.log(ctx.error.message);
                  setError(ctx.error.message);
                },
              },
            );
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
            setError(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 px-6 pt-10 pb-6">
        <div>
          <Logo />
        </div>
        <p className="text-muted-foreground text-sm">Sign in to your vault</p>
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
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    </FieldContent>

                    <InputGroup className="h-11">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        type="email"
                        placeholder="you@example.com"
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
                    className="mt-2 w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogInIcon className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                );
              }}
            />
          </FieldGroup>
        </form>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-center pt-4 pb-6">
          <p className="text-muted-foreground text-xs">
            Don't have an account?{" "}
            <a
              href={`${apiBaseUrl}/pricing/personal`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
