import React from "react";
import { User } from "better-auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@repo/ui/components/sidebar";

import AppSidebarFooter from "./app-sidebar-footer";
import AppSidebarHeader from "./app-sidebar-header";
import AppSidebarMenu from "./app-sidebar-menu";
import AppSidebarTypesMenu from "./app-sidebar-types-menu";

const AppSidebar = ({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarHeader />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarMenu />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <AppSidebarTypesMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AppSidebarFooter user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
