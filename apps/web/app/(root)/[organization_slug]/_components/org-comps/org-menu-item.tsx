"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { IconBuilding } from "@tabler/icons-react";
import { type Organization } from "better-auth/plugins";

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

  const handleSelectOrganization = (e: Event) => {
    e.preventDefault();
    if (organization_slug === org.slug) return;

    authClient.organization.setActive({
      organizationId: org.id,
      organizationSlug: org.slug,
    });
    router.replace(`/${org.slug}/all-items`);
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
