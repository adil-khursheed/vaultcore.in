import React from "react";
import AddItemButton from "@/components/shared/add-item-button";
import SearchInput from "@/components/shared/search-input";

import { Sheet } from "@repo/ui/components/sheet";
import { SidebarProvider } from "@repo/ui/components/sidebar";

import AppSidebar from "./_components/app-sidebar";
import CredentialDetails from "./_components/credential-comps/credential-details";
import MainHeader from "./_components/main-header";
import RedirectUnauthorizedUser from "./_components/redirect-unauthorized-user";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <RedirectUnauthorizedUser>
      <SidebarProvider>
        <AppSidebar />

        <main className="flex w-full flex-1 flex-col items-start">
          <MainHeader />
          <div className="flex w-full flex-1">
            <Sheet>
              <div className="border-border flex h-full w-full flex-col border-r md:w-2/5">
                <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                  <SearchInput />
                  <AddItemButton />
                </div>
                <div className="flex-1">{children}</div>
              </div>

              <CredentialDetails />
            </Sheet>
          </div>
        </main>
      </SidebarProvider>
    </RedirectUnauthorizedUser>
  );
};

export default ProtectedLayout;
