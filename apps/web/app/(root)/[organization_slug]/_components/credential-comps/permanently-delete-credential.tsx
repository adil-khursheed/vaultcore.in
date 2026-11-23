"use client";

import React from "react";
import { useTRPC } from "@/lib/trpc/client";
import { IconTrashX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

import ConfirmDialog from "../confirm-dialog";

/**
 * Permanently removes an item that is already in the trash. Unlike the normal
 * delete action, this cannot be undone.
 */
const PermanentlyDeleteCredential = ({ title }: { title: string }) => {
  const { selectedCredential, setSelectedCredential } = useCredentialStore();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation(
    trpc.credential.permanentDelete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.credential.getCredentials.pathKey(),
        });
        setSelectedCredential(null);
        toast.success("Item permanently deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't delete the item");
      },
    }),
  );

  const handleDelete = async () => {
    if (!selectedCredential) return;

    try {
      await mutateAsync({
        id: selectedCredential.id,
        organizationId: selectedCredential.organizationId,
      });
      setConfirmOpen(false);
    } catch {
      // The mutation already reports the failure; keep the dialog open.
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive h-8 w-8"
        aria-label="Delete permanently"
        title="Delete permanently"
        onClick={() => setConfirmOpen(true)}
      >
        <IconTrashX className="size-4" aria-hidden="true" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete permanently?"
        description={`“${title}” will be erased forever. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default PermanentlyDeleteCredential;
