import React from "react";
import VaultCore from "@/components/icons/vaultcore";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const AppSidebarHeader = () => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif text-lg font-semibold">
                  <VaultCore className="size-7" />
                  <span>
                    Vault<span className="text-muted-foreground">Core</span>
                  </span>
                </div>
                <ChevronDown className="size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default AppSidebarHeader;
