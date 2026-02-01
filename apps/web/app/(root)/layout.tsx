import React from "react";

import { SidebarProvider } from "@repo/ui/components/sidebar";

import AppSidebar from "./_components/app-sidebar";
import MainHeader from "./_components/main-header";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex w-full flex-1 flex-col items-start">
        <MainHeader />
        <div className="w-full flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
