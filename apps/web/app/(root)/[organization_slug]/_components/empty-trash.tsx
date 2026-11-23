"use client";

import React from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { IconTrashX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

import ConfirmDialog from "./confirm-dialog";

/**
 * Permanently deletes every item currently in the organization's trash.
 */
const EmptyTrash = () => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const { setSelectedCredential } = useCredentialStore();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation(
    trpc.credential.emptyTrash.mutationOptions({
      onSuccess: async (result) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.credential.getCredentials.pathKey(),
        });
        setSelectedCredential(null);
        toast.success(
          result.deletedCount === 1
            ? "1 item permanently deleted"
            : `${result.deletedCount} items permanently deleted`,
        );
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't empty the trash");
      },
    }),
  );

  const handleEmpty = async () => {
    if (!activeOrg?.id) return;

    try {
      await mutateAsync({ organizationId: activeOrg.id });
      setConfirmOpen(false);
    } catch {
      // The mutation already reports the failure; keep the dialog open.
    }
  };

  if (!activeOrg?.id) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive h-8 gap-1.5"
        onClick={() => setConfirmOpen(true)}
      >
        <IconTrashX className="size-4" aria-hidden="true" />
        Empty trash
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Empty the trash?"
        description="Every item in the trash will be erased forever. This cannot be undone."
        confirmLabel="Empty trash"
        destructive
        isPending={isPending}
        onConfirm={handleEmpty}
      />
    </>
  );
};

export default EmptyTrash;
