import React from "react";

import { SidebarProvider } from "@repo/ui/components/sidebar";

import AppSidebar from "./_components/app-sidebar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main>{children}</main>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
