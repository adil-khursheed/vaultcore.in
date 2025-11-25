import React from "react";
import { Sidebar, SidebarHeader } from "@repo/ui/components/sidebar";
import LogoutButton from "./logout-button";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <LogoutButton />
      </SidebarHeader>
    </Sidebar>
  );
};

export default AppSidebar;
