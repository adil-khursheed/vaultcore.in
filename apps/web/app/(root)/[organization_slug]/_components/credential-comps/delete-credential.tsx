"use client";

import { useUpdateCredential } from "@/hooks/use-update-credential";
import { IconTrash } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

const DeleteCredential = () => {
  const { selectedCredential } = useCredentialStore();

  const { updateMutate, isPending } = useUpdateCredential({
    isDeleted: true,
  });

  const handleMarkFavorite = async () => {
    if (!selectedCredential) return;
    await updateMutate({
      id: selectedCredential.id,
      organizationId: selectedCredential.organizationId,
      isDeleted: true,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
      disabled={isPending}
      onClick={handleMarkFavorite}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <IconTrash className="size-4" />
      )}
    </Button>
  );
};

export default DeleteCredential;
