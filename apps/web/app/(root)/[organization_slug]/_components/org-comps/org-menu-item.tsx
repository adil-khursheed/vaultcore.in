"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { IconBuilding } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { type Organization } from "better-auth/plugins";
import { toast } from "sonner";

import { unwrapVaultKeyFromMember } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { DropdownMenuItem } from "@repo/ui/components/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";

const OrgMenuItem = ({ org }: { org: Organization }) => {
  const { organization_slug } = useParams<{ organization_slug: string }>();

  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { getPrivateKey, setVaultKey } = useVaultStore();

  const handleSelectOrganization = async (e: Event) => {
    e.preventDefault();
    if (organization_slug === org.slug) return;

    await authClient.organization.setActive({
      organizationId: org.id,
      organizationSlug: org.slug,
    });

    try {
      // Fetch the vault key for the new organization
      const vaultData = await queryClient.fetchQuery(
        trpc.vault.getMyVaultKey.queryOptions({
          organizationId: org.id,
        }),
      );

      const privateKey = getPrivateKey();
      if (!privateKey) {
        throw new Error("Private key not unlocked");
      }

      // Unwrap it
      const unwrappedVaultKey = await unwrapVaultKeyFromMember(
        vaultData.vaultKeyData.encryptedKey,
        privateKey,
      );

      setVaultKey(unwrappedVaultKey);
      router.replace(`/${org.slug}/all-items`);
    } catch (error) {
      console.error("Failed to unwrap org vault key", error);
      toast.error(
        "Failed to access organization vault. Please re-enter your master password.",
      );
      // Could optionally redirect to /lock here
    }
  };

  return (
    <DropdownMenuItem
      className={cn(
        organization_slug === org.slug && "bg-accent text-accent-foreground",
      )}
      onSelect={(e) => handleSelectOrganization(e)}
    >
      <Avatar className="size-6 rounded-md">
        <AvatarImage src={org.logo || undefined} />
        <AvatarFallback>
          <IconBuilding className="size-4" />
        </AvatarFallback>
      </Avatar>
      <span>{org.name}</span>
    </DropdownMenuItem>
  );
};

export default OrgMenuItem;
