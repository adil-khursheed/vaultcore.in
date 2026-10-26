"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useForm } from "@tanstack/react-form";
import { Loader2Icon, MailIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod/v4";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

const InviteMemberSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["member", "admin"]),
});

type InviteMemberDialogProps = {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
};

const InviteMemberDialog = ({
  organizationId,
  open,
  onOpenChange,
  onInvited,
}: InviteMemberDialogProps) => {
  const form = useForm({
    defaultValues: {
      email: "",
      role: "member" as "member" | "admin",
    },
    validators: {
      onSubmit: InviteMemberSchema,
    },
    onSubmit: async (data) => {
      try {
        const { error } = await authClient.organization.inviteMember({
          email: data.value.email,
          role: data.value.role,
          organizationId,
        });

        if (error) {
          toast.error(error.message || "Couldn't send the invitation.");
          return;
        }

        toast.success(`Invitation sent to ${data.value.email}`);
        form.reset();
        onInvited?.();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to invite member", error);
        toast.error("Couldn't send the invitation. Please try again.");
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join this organization. Vault access is
            granted separately after they join.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        placeholder="teammate@example.com"
                      />

                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />

            <form.Field
              name="role"
              children={(field) => (
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  </FieldContent>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "member" | "admin")
                    }
                  >
                    <SelectTrigger id={field.name} className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Admins can invite people and grant vault access.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <UserPlusIcon aria-hidden="true" />
                  )}
                  Send invitation
                </Button>
              </DialogFooter>
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
