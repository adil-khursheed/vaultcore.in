"use client";

import React from "react";
import ItemForm from "@/components/shared/item-form";
import { useUpdateCredential } from "@/hooks/use-update-credential";
import { authClient } from "@/lib/auth/client";
import { encryptString } from "@/lib/utils";
import { IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

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

  const { selectedCredential, setSelectedCredential } = useCredentialStore();
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

  const handleSubmit = async (values: any) => {
    if (!vaultKey || !session?.session.activeOrganizationId) {
      toast.error("Vault is locked or organization not selected");
      return;
    }

    try {
      const { title, type, note, isFavorite, ...rest } = values;

      let encryptedData: any = {};
      let username = "";
      let password = "";
      let url = "";
      let otp = "";

      if (type === "login") {
        username = rest.username
          ? await encryptString(rest.username, vaultKey)
          : "";
        password = rest.password
          ? await encryptString(rest.password, vaultKey)
          : "";
        url = rest.url ? await encryptString(rest.url, vaultKey) : "";
        otp = rest.otp ? await encryptString(rest.otp, vaultKey) : "";
      } else {
        // For other types, encrypt all fields into the data blob
        for (const [key, value] of Object.entries(rest)) {
          if (value && typeof value === "string") {
            encryptedData[key] = await encryptString(value, vaultKey);
          } else {
            encryptedData[key] = value;
          }
        }
      }

      await updateMutate({
        id: selectedCredential?.id!,
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
      console.error("Failed to create item:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
        >
          <IconEdit className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full px-0 sm:max-w-2xl">
        <DialogHeader className="px-6">
          <DialogTitle>Edit Credential</DialogTitle>
          <DialogDescription>Edit the selected credential</DialogDescription>
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
