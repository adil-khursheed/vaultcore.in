import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCredentialStore } from "@repo/store";

export const useUpdateCredential = ({
  setOpen,
  clearSelection = false,
  successMessage = "Credential updated successfully",
}: {
  setOpen?: (open: boolean) => void;
  clearSelection?: boolean;
  successMessage?: string;
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

        if (clearSelection) {
          setSelectedCredential(null);
        } else {
          setSelectedCredential(data);
        }

        toast.success(successMessage);
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
