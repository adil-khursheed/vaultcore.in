"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

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
import { decryptVaultKey, deriveKeys, encryptVaultKey, generateVaultKey } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { useVaultStore } from "@repo/store";

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
            const data = await queryClient.fetchQuery(
              trpc.vault.getVaultKey.queryOptions({ userId: ctx.data.user.id })
            );

            const decryptedVaultKey = await decryptVaultKey({
              encryptedKey: data.vaultKeyData.key,
              iv: data.vaultKeyData.iv
            }, masterKey);

            setMasterKey(masterKey);
            setVaultKey(decryptedVaultKey);

            router.replace("/dashboard");
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
            toast.error("Error while logging in.")
          },
        }
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
        <Button type="submit">Login</Button>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
