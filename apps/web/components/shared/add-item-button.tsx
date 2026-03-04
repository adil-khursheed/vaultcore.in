"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { encryptString } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useVaultStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

import ItemForm from "./item-form";

const AddItemButton = () => {
  const [open, setOpen] = React.useState(false);
  const trpc = useTRPC();
  const { vaultKey } = useVaultStore();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { mutateAsync: createMutate, isPending } = useMutation(
    trpc.credential.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.credential.getCredentials.pathKey(),
        });
        toast.success("Item added successfully");
        setOpen(false);
      },
      onError: (error) => {
        console.log(error.message);
        toast.error(error.message);
      },
    }),
  );

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

      await createMutate({
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
        <Button>
          <IconPlus className="size-4" />
          <span className="sr-only">Add New Vault Item</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full px-0 sm:max-w-2xl">
        <DialogHeader className="px-6">
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>Add a new item to your vault.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <ItemForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemButton;
