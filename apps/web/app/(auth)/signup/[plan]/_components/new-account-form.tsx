"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { VerifyNewUserEmailSchema } from "@repo/db/schema";
import { Button } from "@repo/ui/components/button";
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

type NewAccountFormProps = {
  invitationId?: string;
  invitedEmail?: string;
};

const NewAccountForm = ({
  invitationId,
  invitedEmail,
}: NewAccountFormProps) => {
  const router = useRouter();

  const trpc = useTRPC();

  const submitEmail = useMutation(
    trpc.auth.sendVerificationEmail.mutationOptions({
      onSuccess: () => {
        form.reset();
        router.replace("/signup/thank-you");
      },
      onError: (err) => {
        console.log(err);
        toast.error(err.message || "Failed to submit email");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      email: invitedEmail ?? "",
    },
    validators: {
      onSubmit: VerifyNewUserEmailSchema,
    },
    onSubmit: async (data) =>
      await submitEmail.mutateAsync({
        ...data.value,
        invitationId,
      }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
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
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="you@example.com"
                    className="h-full"
                    readOnly={!!invitedEmail}
                    aria-readonly={!!invitedEmail}
                  />

                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>
                {invitedEmail ? (
                  <FieldDescription>
                    This invitation is for {invitedEmail}.
                  </FieldDescription>
                ) : null}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                disabled={!canSubmit || isSubmitting}
                className="h-11"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default NewAccountForm;
