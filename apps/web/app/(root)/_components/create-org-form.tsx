"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  Building2Icon,
  LinkIcon,
  Loader2Icon,
  ShieldAlertIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { generateVaultKey, wrapVaultKeyForMember } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";

const CreateOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Use 64 characters or fewer"),
  slug: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .max(64, "Use 64 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens only",
    ),
});

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
};

type PendingSetup = {
  organizationId: string;
  organizationSlug: string;
  userId: string;
  encryptedKey: string;
  vaultKey: CryptoKey;
};

type CreateOrgFormProps = {
  variant?: "page" | "dialog";
};

const CreateOrgForm = ({ variant = "dialog" }: CreateOrgFormProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const { setVaultKey } = useVaultStore();

  const [pendingSetup, setPendingSetup] = useState<PendingSetup | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const grantVaultAccess = useMutation(
    trpc.vault.selfGrantVaultAccess.mutationOptions({}),
  );

  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const user = sessionData?.user as
    | (NonNullable<typeof sessionData>["user"] & { publicKey?: string })
    | undefined;

  const hasPublicKey = Boolean(user?.publicKey);

  const completeVaultSetup = async (setup: PendingSetup) => {
    const { error: setActiveError } = await authClient.organization.setActive({
      organizationId: setup.organizationId,
      organizationSlug: setup.organizationSlug,
    });

    if (setActiveError) {
      throw setActiveError;
    }

    await grantVaultAccess.mutateAsync({
      organizationId: setup.organizationId,
      userId: setup.userId,
      encryptedKey: setup.encryptedKey,
    });

    setVaultKey(setup.vaultKey);
    toast.success("Organization created successfully");
    router.replace(`/${setup.organizationSlug}/all-items`);
  };

  const retryVaultSetup = async () => {
    if (!pendingSetup) return;

    setIsRetrying(true);

    try {
      await completeVaultSetup(pendingSetup);
    } catch (error) {
      console.error("Failed to finish organization setup", error);
      toast.error(
        "Setup still didn't finish. Check your connection and try again.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onSubmit: CreateOrgSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user?.publicKey) {
        toast.error(
          "Upgrade your encryption keys before creating an organization.",
        );
        return;
      }

      const parsed = CreateOrgSchema.safeParse(value);

      if (!parsed.success) {
        toast.error("Please fix the highlighted fields and try again.");
        return;
      }

      let vaultKey: CryptoKey;
      let encryptedKey: string;

      try {
        const publicKeyJwk = JSON.parse(atob(user.publicKey));
        vaultKey = await generateVaultKey();
        encryptedKey = await wrapVaultKeyForMember(vaultKey, publicKeyJwk);
      } catch (error) {
        console.error("Failed to prepare vault key", error);
        toast.error(
          "We couldn't prepare your vault key on this device. Please try again.",
        );
        return;
      }

      try {
        const { data: organization, error } =
          await authClient.organization.create({
            name: parsed.data.name,
            slug: parsed.data.slug,
          });

        if (error || !organization) {
          toast.error(error?.message ?? "Could not create the organization.");
          return;
        }

        const setup = {
          organizationId: organization.id,
          organizationSlug: organization.slug,
          userId: user.id,
          encryptedKey,
          vaultKey,
        };

        try {
          await completeVaultSetup(setup);
        } catch (error) {
          console.error("Failed to finish organization setup", error);
          setPendingSetup(setup);
          toast.error(
            "Organization created, but setup didn't finish. Retry to secure its vault.",
          );
        }
      } catch (error) {
        console.error("Failed to create organization", error);
        toast.error(
          "Something went wrong while creating the organization. Please try again.",
        );
      }
    },
  });

  if (pendingSetup) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="bg-muted/50 flex gap-3 rounded-lg border p-4"
          role="alert"
        >
          <TriangleAlertIcon className="text-destructive mt-0.5 size-5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Your organization was created</p>
            <p className="text-muted-foreground text-sm">
              We couldn&apos;t finish securing its vault. Retry to complete your
              workspace setup.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size={variant === "page" ? "lg" : "default"}
          className="w-full"
          onClick={retryVaultSetup}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2Icon className="animate-spin" />
              Retrying vault setup&hellip;
            </>
          ) : (
            "Retry vault setup"
          )}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-4">
        {!isSessionPending && user && !hasPublicKey && (
          <div className="bg-muted/50 flex gap-3 rounded-lg border p-4">
            <ShieldAlertIcon className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Encryption keys required</p>
              <p className="text-muted-foreground text-sm">
                Your account doesn&apos;t have a public key yet.{" "}
                <Link
                  href="/migrate"
                  className="text-foreground underline underline-offset-4"
                >
                  Upgrade your security keys
                </Link>{" "}
                to create an organization.
              </p>
            </div>
          </div>
        )}

        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                </FieldContent>

                <InputGroup className="h-11">
                  <InputGroupAddon>
                    <Building2Icon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      const newName = e.target.value;
                      field.handleChange(newName);
                      form.setFieldValue("slug", generateSlug(newName));
                    }}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    autoComplete="organization"
                    placeholder="Enter organization name"
                    disabled={!hasPublicKey || isSessionPending}
                  />
                </InputGroup>
                {isInvalid && (
                  <FieldError
                    errors={field.state.meta.errors.map((error) =>
                      typeof error === "string" ? { message: error } : error,
                    )}
                  />
                )}
              </Field>
            );
          }}
        />

        <form.Field
          name="slug"
          validators={{
            onChange: CreateOrgSchema.shape.slug,
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              if (value.length < 3) return;

              const res = await authClient.organization.checkSlug({
                slug: value,
              });

              if (res.error) {
                return {
                  message:
                    res.error.status === 400
                      ? "That slug is already taken. Try another one."
                      : "Couldn't check availability. Try again.",
                };
              }
            },
          }}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                </FieldContent>

                <InputGroup className="h-11">
                  <InputGroupAddon>
                    <LinkIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase())
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="organization-slug"
                    disabled={!hasPublicKey || isSessionPending}
                  />
                </InputGroup>
                <FieldDescription>
                  {field.state.meta.isValidating
                    ? "Checking availability\u2026"
                    : "Lowercase letters, numbers, and single hyphens. Used in your vault URL."}
                </FieldDescription>
                {isInvalid && (
                  <FieldError
                    errors={field.state.meta.errors.map((error) =>
                      typeof error === "string" ? { message: error } : error,
                    )}
                  />
                )}
              </Field>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => {
            const isDisabled =
              !canSubmit || isSubmitting || !hasPublicKey || isSessionPending;

            return variant === "dialog" ? (
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isDisabled}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Creating organization&hellip;
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </DialogFooter>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Creating organization&hellip;
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default CreateOrgForm;
