"use client";

import { useUpdateCredential } from "@/hooks/use-update-credential";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

import { useCredentialStore } from "@repo/store";
import { Button } from "@repo/ui/components/button";

const MarkFavorite = () => {
  const { selectedCredential } = useCredentialStore();

  const { updateMutate, isPending } = useUpdateCredential({});

  const handleMarkFavorite = async () => {
    if (!selectedCredential) return;
    await updateMutate({
      id: selectedCredential.id,
      organizationId: selectedCredential.organizationId,
      isFavorite: !selectedCredential.isFavorite,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-8 cursor-pointer"
      onClick={handleMarkFavorite}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : selectedCredential?.isFavorite ? (
        <IconStarFilled className="text-primary size-4" />
      ) : (
        <IconStar className="size-4" />
      )}
    </Button>
  );
};

export default MarkFavorite;
