"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import { DialogClose, DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { InputGroup, InputGroupInput } from "@repo/ui/components/input-group";

const CreateOrgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase alphanumeric characters and hyphens",
    ),
});

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word chars except spaces and hyphens
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // remove multiple hyphens
    .trim();
};

const CreateOrgForm = () => {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onSubmit: CreateOrgSchema,
    },
    onSubmit: async (data) => {
      await authClient.organization.create(
        {
          name: data.value.name,
          slug: data.value.slug,
        },
        {
          onSuccess: async (ctx) => {
            await authClient.organization.setActive(
              {
                organizationId: ctx.data.id,
                organizationSlug: ctx.data.slug,
              },
              {
                onSuccess: () => {
                  toast.success("Organization created successfully");
                  router.replace(`/${ctx.data.slug}/all-items`);
                },
                onError: (ctx) => {
                  toast.error(ctx.error.message);
                },
              },
            );
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  const session = authClient.useSession();
  console.log(session.data);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-4">
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
                    placeholder="Enter organization name"
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
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              if (value.length < 3) return;
              const res = await authClient.organization.checkSlug({
                slug: value,
              });
              if (!res.data) {
                return { message: "Slug is already taken" };
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
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase())
                    }
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="organization-slug"
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

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => {
            return (
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </DialogFooter>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};

export default CreateOrgForm;
