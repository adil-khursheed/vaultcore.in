import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCredentialStore } from "@repo/store";

export const useUpdateCredential = ({
  setOpen,
  isDeleted = false,
}: {
  setOpen?: (open: boolean) => void;
  isDeleted?: boolean;
}) => {
  const { setSelectedCredential } = useCredentialStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutateAsync: updateMutate, isPending } = useMutation(
    trpc.credential.update.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.credential.getCredentials.pathKey(),
        });

        if (isDeleted) {
          setSelectedCredential(null);
        } else {
          setSelectedCredential(data);
        }

        toast.success("Credential updated successfully");
        setOpen?.(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return {
    updateMutate,
    isPending,
  };
};
