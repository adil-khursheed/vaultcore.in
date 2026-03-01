"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import VaultCore from "@/components/icons/vaultcore";
import { authClient } from "@/lib/auth/client";
import { IconBuilding, IconPlus } from "@tabler/icons-react";
import { type Organization } from "better-auth/plugins";
import { ChevronDown } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Dialog, DialogTrigger } from "@repo/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import { cn } from "@repo/ui/lib/utils";

import CreateOrgDialog from "./org-comps/create-org-dialog";
import OrgMenuItem from "./org-comps/org-menu-item";

const AppSidebarHeader = () => {
  const { organization_slug } = useParams<{ organization_slug: string }>();
  const router = useRouter();
  const { isMobile } = useSidebar();

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();

  return (
    <SidebarMenu className="gap-3">
      <SidebarMenuItem>
        <SidebarMenuButton className="hover:bg-transparent">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold">
            <VaultCore className="size-6" />
            <span>
              Vault<span className="text-primary">Core</span>
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size={"lg"}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-7 rounded-lg">
                    <AvatarImage src={activeOrganization?.logo || undefined} />
                    <AvatarFallback>
                      <IconBuilding className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{activeOrganization?.name}</span>
                </div>
                <ChevronDown />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  My Organizations
                </DropdownMenuLabel>

                {organizations && organizations?.length > 0
                  ? organizations?.map((org) => (
                      <OrgMenuItem key={org.id} org={org} />
                    ))
                  : null}

                {organizations && organizations.length > 0 && (
                  <DropdownMenuSeparator />
                )}

                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <DialogTrigger asChild>
                    <div className="flex items-center gap-2">
                      <IconPlus className="mr-2 size-4" />
                      <span>Create Organization</span>
                    </div>
                  </DialogTrigger>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateOrgDialog />
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AppSidebarHeader;
