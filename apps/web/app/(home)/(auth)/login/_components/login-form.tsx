"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { decryptVaultKey, deriveKeys } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { toast } from "sonner";

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

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { setMasterKey, setVaultKey } = useVaultStore();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      const { masterKey, passwordHash } = await deriveKeys(
        data.value.password,
        data.value.email,
      );

      await authClient.signIn.email(
        {
          email: data.value.email,
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
                  const data = await queryClient.fetchQuery(
                    trpc.vault.getVaultKey.queryOptions({
                      organizationId: ctx.data.organization.id,
                    }),
                  );

                  const decryptedVaultKey = await decryptVaultKey(
                    {
                      encryptedKey: data.vaultKeyData.key,
                      iv: data.vaultKeyData.iv,
                    },
                    masterKey,
                  );

                  setMasterKey(masterKey);
                  setVaultKey(decryptedVaultKey);
                  sessionStorage.setItem(
                    "user-account",
                    JSON.stringify({
                      email: ctx.data.user.email,
                      emailVerified: ctx.data.user.emailVerified,
                    }),
                  );

                  router.replace(`/${ctx.data.organization.slug}/all-items`);
                },
                onError: (ctx) => {
                  console.log(ctx.error.message);
                  toast.error(ctx.error.message);
                },
              },
            );
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
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
                    aria-invalid={isInvalid}
                    placeholder="Enter your email"
                  />

                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <FieldLabel htmlFor={field.name}>Master Password</FieldLabel>
                </FieldContent>

                <InputGroup className="h-11">
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your master password"
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
                  "Login"
                )}
              </Button>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
