"use client";

import { useUpdateCredential } from "@/hooks/use-update-credential";
import { IconRestore } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

const RestoreCredential = () => {
  const { selectedCredential } = useCredentialStore();

  const { updateMutate, isPending } = useUpdateCredential({
    clearSelection: true,
    successMessage: "Credential restored",
  });

  const handleRestore = async () => {
    if (!selectedCredential) return;
    await updateMutate({
      id: selectedCredential.id,
      organizationId: selectedCredential.organizationId,
      isDeleted: false,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={handleRestore}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <IconRestore className="size-4" aria-hidden="true" />
      )}
      Restore
    </Button>
  );
};

export default RestoreCredential;
