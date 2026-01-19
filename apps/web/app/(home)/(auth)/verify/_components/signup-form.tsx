"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import {
  calculatePasswordStrength,
  deriveKeys,
  encryptVaultKey,
  generateVaultKey,
} from "@/lib/utils";
import CryptoService from "@/services/crypto-service";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod/v4";

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
import { Progress } from "@repo/ui/components/progress";

export const SignUpSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .max(128, "Password must be at most 128 characters long"),
    confirm_password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .max(128, "Password must be at most 128 characters long"),
  })
  .refine((data) => {
    if (data.password === data.confirm_password) {
      return true;
    }

    return false;
  }, "Passwords do not match.");

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const router = useRouter();

  const trpc = useTRPC();

  const cryptoService = new CryptoService();

  const verifyToken = useMutation(
    trpc.auth.verifyEmail.mutationOptions({
      onSuccess: (data) => {
        sessionStorage.setItem(
          "user-account",
          JSON.stringify({ email: data.email, emailVerified: true }),
        );
        toast.success("Email verified successfully");
      },
      onError: () => {
        router.replace("/");
        toast.error("Email verification failed");
      },
    }),
  );

  useEffect(() => {
    if (token) {
      verifyToken.mutate({ token });
    }
  }, []);

  const insertVaultKey = useMutation(
    trpc.vault.createVaultKey.mutationOptions({})
  )

  const form = useForm({
    defaultValues: {
      password: "",
      confirm_password: "",
    },
    validators: {
      onSubmit: SignUpSchema,
    },
    onSubmit: async (data) => {
      try {
        const user_account = sessionStorage.getItem("user-account");
        const user_email: string = JSON.parse(user_account!).email;

        const { masterKey, passwordHash } = await deriveKeys(
          data.value.password,
          user_email,
        );
        const vaultKey = await generateVaultKey();
        const encryptedVaultKey = await encryptVaultKey(vaultKey, masterKey);

        await authClient.signUp.email(
          {
            email: user_email,
            password: passwordHash,
            name: user_email.split("@")[0]?.toLowerCase() ?? "",
          },
          {
            onSuccess: (ctx) => {
              cryptoService.setMasterKey(masterKey);
              cryptoService.setVaultKey(vaultKey);

              insertVaultKey.mutate({
                userId: ctx.data.user.id,
                key: encryptedVaultKey.encryptedKey,
                iv: encryptedVaultKey.iv
              });

              router.replace("/dashboard");
            },
            onError: (ctx) => {
              console.log(ctx.error);
              toast.error(ctx.error.message);
            }
          }
        );
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-4">
        <form.Field
          name="password"
          listeners={{
            onChange: ({ value }) => {
              if (!value) return "Password is required";
              const strength = calculatePasswordStrength(value);
              if (strength.score < 50) {
                return "Password is too weak";
              }
              return undefined;
            },
          }}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            const strength = calculatePasswordStrength(field.state.value);

            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel
                    htmlFor={field.name}
                    className={`text-[${strength.color}]`}
                  >
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

                  <InputGroupAddon>
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant={"ghost"}
                      size={"icon-sm"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <Progress
                  value={strength.score}
                  data-level={strength.level}
                  indicatorStyle={{ backgroundColor: strength.color }}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="confirm_password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    Confirm Master Password
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
                    placeholder="Re-enter your master password"
                    aria-invalid={isInvalid}
                  />

                  <InputGroupAddon>
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant={"ghost"}
                      size={"icon-sm"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => {
            return (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default SignUpForm;
