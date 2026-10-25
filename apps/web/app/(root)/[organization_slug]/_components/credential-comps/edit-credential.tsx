"use client";

import React from "react";
import ItemForm from "@/components/shared/item-form";
import { useUpdateCredential } from "@/hooks/use-update-credential";
import { authClient } from "@/lib/auth/client";
import { IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

import { encryptString } from "@repo/crypto";
import { ItemFormValues } from "@repo/db/types";
import { useCredentialStore, useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

const EditCredential = ({
  decryptedFields,
}: {
  decryptedFields: Record<string, string>;
}) => {
  const [open, setOpen] = React.useState(false);

  const { selectedCredential } = useCredentialStore();
  const { vaultKey } = useVaultStore();

  const { data: session } = authClient.useSession();

  // Build initialValues from selectedCredential + decryptedFields
  const initialValues: Partial<ItemFormValues> = selectedCredential
    ? {
        title: selectedCredential.title,
        type: selectedCredential.type,
        isFavorite: selectedCredential.isFavorite ?? false,
        note: decryptedFields.note ?? "",
        ...decryptedFields, // spreads decrypted username, password, url, etc.
      }
    : {};

  const { updateMutate, isPending } = useUpdateCredential({
    setOpen,
  });

  const handleSubmit = async (values: ItemFormValues) => {
    if (!vaultKey || !session?.session.activeOrganizationId) {
      toast.error("Vault is locked or organization not selected");
      return;
    }

    if (!selectedCredential) {
      toast.error("No credential selected");
      return;
    }

    try {
      const { title, type, note, isFavorite, ...rest } = values;
      const restValues = rest as unknown as Record<string, unknown>;

      const encryptedData: Record<string, unknown> = {};
      let username = "";
      let password = "";
      let url = "";
      let otp = "";

      if (type === "login") {
        username =
          typeof restValues.username === "string" && restValues.username
            ? await encryptString(restValues.username, vaultKey)
            : "";
        password =
          typeof restValues.password === "string" && restValues.password
            ? await encryptString(restValues.password, vaultKey)
            : "";
        url =
          typeof restValues.url === "string" && restValues.url
            ? await encryptString(restValues.url, vaultKey)
            : "";
        otp =
          typeof restValues.otp === "string" && restValues.otp
            ? await encryptString(restValues.otp, vaultKey)
            : "";
      } else {
        // For other types, encrypt all fields into the data blob
        for (const [key, value] of Object.entries(restValues)) {
          if (value && typeof value === "string") {
            encryptedData[key] = await encryptString(value, vaultKey);
          } else {
            encryptedData[key] = value;
          }
        }
      }

      await updateMutate({
        id: selectedCredential.id,
        title,
        type,
        note,
        organizationId: session.session.activeOrganizationId,
        username: username || undefined,
        password: password || undefined,
        url: url || undefined,
        otp: otp || undefined,
        isFavorite: !!isFavorite,
        data: Object.keys(encryptedData).length > 0 ? encryptedData : undefined,
      });
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Couldn't save your changes. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          aria-label="Edit item"
          title="Edit item"
        >
          <IconEdit className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full px-0 sm:max-w-2xl">
        <DialogHeader className="px-6">
          <DialogTitle>Edit Credential</DialogTitle>
          <DialogDescription>
            Update the details for “{selectedCredential?.title}”.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <ItemForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCredential;
