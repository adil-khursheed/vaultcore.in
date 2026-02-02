import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@repo/ui/components/sidebar";

import AppSidebarFooter from "./app-sidebar-footer";
import AppSidebarHeader from "./app-sidebar-header";
import AppSidebarMenu from "./app-sidebar-menu";
import AppSidebarTypesMenu from "./app-sidebar-types-menu";

const AppSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <Sidebar {...props}>
      <AppSidebarHeader />

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
