"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod/v4";

import {
  calculatePasswordStrength,
  computeKeyFingerprint,
  deriveKeys,
  encryptPrivateKey,
  generateUserKeyPair,
  generateVaultKey,
  wrapVaultKeyForMember,
} from "@repo/crypto";
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
    if (data.password !== data.confirm_password) {
      return false;
    }

    return true;
  }, "Passwords do not match.");

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const router = useRouter();

  const trpc = useTRPC();

  const { setMasterKey, setVaultKey, setPrivateKey } = useVaultStore();

  const verifyToken = useMutation(
    trpc.auth.verifyEmail.mutationOptions({
      onSuccess: (data) => {
        setVerifiedEmail(data.email);
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
  }, [token, verifyToken]);

  const grantVaultAccess = useMutation(
    trpc.vault.selfGrantVaultAccess.mutationOptions({}),
  );

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
        if (!verifiedEmail || !token) {
          toast.error("Please verify your email first");
          return;
        }

        const { masterKey, passwordHash } = await deriveKeys(
          data.value.password,
          verifiedEmail,
        );

        // 1. Generate RSA key pair and encrypt the private key
        const userKeyPair = await generateUserKeyPair();
        const encryptedPrivKeyData = await encryptPrivateKey(
          userKeyPair.privateKey,
          masterKey,
        );

        // Export public key to base64 string
        const publicKeyJwk = await crypto.subtle.exportKey(
          "jwk",
          userKeyPair.publicKey,
        );
        const publicKeyBase64 = btoa(JSON.stringify(publicKeyJwk));

        // Compute fingerprint
        const fingerprint = await computeKeyFingerprint(publicKeyJwk);

        // 2. Generate Organization Vault Key and wrap it
        const vaultKey = await generateVaultKey();
        const wrappedVaultKeyBase64 = await wrapVaultKeyForMember(
          vaultKey,
          publicKeyJwk,
        );

        await authClient.signUp.email(
          {
            email: verifiedEmail,
            password: passwordHash,
            name: verifiedEmail.split("@")[0]?.toLowerCase() ?? "",
            // @ts-expect-error - token is handled by our server-side plugin
            token: token,
            publicKey: publicKeyBase64,
            encryptedPrivateKey: encryptedPrivKeyData.encryptedPrivateKey,
            privateKeyIv: encryptedPrivKeyData.iv,
            publicKeyFingerprint: fingerprint,
          },
          {
            onSuccess: async (signUpCtx) => {
              const newUserId = signUpCtx.data.user.id;

              await authClient.organization.create(
                {
                  name: "Personal",
                  slug: newUserId,
                },
                {
                  onSuccess: async (orgCtx) => {
                    await authClient.organization.setActive({
                      organizationId: orgCtx.data.id,
                      organizationSlug: orgCtx.data.slug,
                    });

                    // Store the RSA-wrapped vault key in memberVaultKey table
                    await grantVaultAccess.mutateAsync({
                      organizationId: orgCtx.data.id,
                      userId: newUserId,
                      encryptedKey: wrappedVaultKeyBase64,
                    });

                    setMasterKey(masterKey);
                    setVaultKey(vaultKey);
                    setPrivateKey(userKeyPair.privateKey);

                    router.replace(`/${orgCtx.data.slug}/all-items`);
                  },
                  onError: (orgErrCtx) => {
                    console.error("Organization Error => ", orgErrCtx.error);
                    toast.error(orgErrCtx.error.message);
                    router.replace("/organization/create");
                  },
                },
              );
            },
            onError: (ctx) => {
              console.log("Sign Up Error => ", ctx.error);
              console.log("Sign Up Error Request => ", ctx.request);
              console.log("Sign Up Error Response => ", ctx.response);
              toast.error(ctx.error.message);
            },
          },
        );
      } catch (err) {
        console.log("Error => ", err);
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
