"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { deleteOrganization } from "@/lib/auth/organization-actions";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

import ConfirmDialog from "../../../_components/confirm-dialog";

/**
 * Owner-only destructive action. Deleting an organization cascades to its
 * members, invitations, vault keys, credentials, and subscription row.
 */
const DeleteOrganization = () => {
  const router = useRouter();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const currentMember = activeOrg?.members.find(
    (member) => member.userId === session?.user.id,
  );
  const isOwner = (currentMember?.role ?? "")
    .split(",")
    .map((role) => role.trim())
    .includes("owner");

  if (!activeOrg || !isOwner) return null;

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await deleteOrganization(activeOrg.id);

      toast.success(`${activeOrg.name} was deleted`);
      setOpen(false);
      router.push("/app");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete organization", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't delete the organization. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="gap-0 overflow-hidden border-destructive/40 py-0">
        <div className="border-destructive/30 border-b px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold">Delete organization</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Permanently delete {activeOrg.name}, including every credential,
            member, and invitation. This cannot be undone.
          </p>
        </div>

        <div className="flex justify-end px-5 py-4 sm:px-6">
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete organization
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete organization?"
        description={`Everything in ${activeOrg.name} will be erased forever, and every member will lose access immediately.`}
        confirmLabel="Delete forever"
        destructive
        isPending={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default DeleteOrganization;
