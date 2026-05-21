"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  decryptPrivateKey,
  deriveKeys,
  unwrapVaultKeyFromMember,
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

export const LockFormSchema = z.object({
  password: z.string().min(1, "Please enter your master password"),
});

const LockForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const { setMasterKey, setVaultKey, setPrivateKey } = useVaultStore();

  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: LockFormSchema,
    },
    onSubmit: async (data) => {
      try {
        const user_email = session?.user.email;

        if (!user_email) {
          toast.error("User email not found");
          return;
        }

        const { masterKey } = await deriveKeys(data.value.password, user_email);

        const user = session?.user as any;

        // 1. Decrypt user's private key
        let privateKey: CryptoKey | null = null;
        if (user && user.encryptedPrivateKey && user.privateKeyIv) {
          try {
            privateKey = await decryptPrivateKey(
              {
                encryptedPrivateKey: user.encryptedPrivateKey,
                iv: user.privateKeyIv,
              },
              masterKey,
            );
          } catch (e) {
            console.error("Failed to decrypt private key", e);
            toast.error(
              "Failed to unlock your vault. Check your master password.",
            );
            return;
          }
        }

        const vaultData = await queryClient.fetchQuery(
          trpc.vault.getMyVaultKey.queryOptions({
            organizationId: activeOrganization?.id!,
          }),
        );

        if (privateKey) {
          const unwrappedVaultKey = await unwrapVaultKeyFromMember(
            vaultData.vaultKeyData.encryptedKey,
            privateKey,
          );

          setPrivateKey(privateKey);
          setMasterKey(masterKey);
          setVaultKey(unwrappedVaultKey);
          router.back();
        } else {
          // Legacy user missing RSA key pair - redirect to migration
          console.warn("User missing RSA key pair, migrating...");
          setMasterKey(masterKey);
          router.replace(`/migrate`);
        }
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
                  "Submit"
                )}
              </Button>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default LockForm;
