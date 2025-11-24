import React from "react";
import { Sidebar, SidebarHeader } from "@repo/ui/components/sidebar";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>SidebarHeader</SidebarHeader>
    </Sidebar>
  );
};

export default AppSidebar;
