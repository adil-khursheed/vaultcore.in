import React from "react";

import { SidebarProvider } from "@repo/ui/components/sidebar";

import AppSidebar from "./_components/app-sidebar";
import MainHeader from "./_components/main-header";
import RedirectUnauthorizedUser from "./_components/redirect-unauthorized-user";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <RedirectUnauthorizedUser>
      <SidebarProvider>
        <AppSidebar />

        <main className="flex h-svh w-full flex-1 flex-col items-start overflow-hidden">
          <MainHeader />
          {children}
        </main>
      </SidebarProvider>
    </RedirectUnauthorizedUser>
  );
};

export default ProtectedLayout;
