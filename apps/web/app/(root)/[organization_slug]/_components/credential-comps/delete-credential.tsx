"use client";

import React from "react";
import { useUpdateCredential } from "@/hooks/use-update-credential";
import { IconTrash } from "@tabler/icons-react";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

import ConfirmDialog from "../confirm-dialog";

const DeleteCredential = () => {
  const { selectedCredential } = useCredentialStore();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const { updateMutate, isPending } = useUpdateCredential({
    clearSelection: true,
    successMessage: "Credential moved to trash",
  });

  const handleDelete = async () => {
    if (!selectedCredential) return;

    try {
      await updateMutate({
        id: selectedCredential.id,
        organizationId: selectedCredential.organizationId,
        isDeleted: true,
      });
      setConfirmOpen(false);
    } catch {
      // The mutation reports the failure with a toast; keep the dialog open.
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
        aria-label="Move item to trash"
        title="Move to trash"
        onClick={() => setConfirmOpen(true)}
      >
        <IconTrash className="size-4" aria-hidden="true" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Move item to trash?"
        description={
          selectedCredential
            ? `“${selectedCredential.title}” will move to Trash. You can restore it later.`
            : "This item will move to Trash."
        }
        confirmLabel="Move to trash"
        destructive
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteCredential;
