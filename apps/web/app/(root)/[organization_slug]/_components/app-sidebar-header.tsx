"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Logo from "@/components/shared/logo";
import { authClient } from "@/lib/auth/client";
import { IconBuilding, IconPlus } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Dialog } from "@repo/ui/components/dialog";
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

import CreateOrgDialog from "./org-comps/create-org-dialog";
import OrgMenuItem from "./org-comps/org-menu-item";

const AppSidebarHeader = () => {
  const { organization_slug } = useParams<{ organization_slug: string }>();
  const { isMobile } = useSidebar();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();

  return (
    <SidebarMenu className="gap-3">
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="hover:bg-transparent">
          <Link
            href={`/${organization_slug}/all-items`}
            aria-label="Go to all items"
          >
            <Logo />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size={"lg"}
                aria-label="Switch organization"
                className="flex items-center justify-between"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="size-7 shrink-0 rounded-lg">
                    <AvatarImage
                      src={activeOrganization?.logo || undefined}
                      alt=""
                    />
                    <AvatarFallback>
                      <IconBuilding className="size-4" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{activeOrganization?.name}</span>
                </div>
                <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
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

                <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                  <IconPlus className="size-4" aria-hidden="true" />
                  <span>Create Organization</span>
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
