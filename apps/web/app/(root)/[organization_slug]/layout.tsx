import React from "react";
import { redirect } from "next/navigation";
import AddItemButton from "@/components/shared/add-item-button";
import SearchInput from "@/components/shared/search-input";
import { getSession } from "@/lib/auth/server";

import { SidebarProvider } from "@repo/ui/components/sidebar";

import AppSidebar from "./_components/app-sidebar";
import MainHeader from "./_components/main-header";
import RedirectUnauthorizedUser from "./_components/redirect-unauthorized-user";

export const dynamic = "force-dynamic";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <RedirectUnauthorizedUser>
      <SidebarProvider>
        <AppSidebar user={user} />

        <main className="flex w-full flex-1 flex-col items-start">
          <MainHeader />
          <div className="flex w-full flex-1">
            <div className="border-border flex h-full w-full flex-col border-r md:w-2/5">
              <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                <SearchInput />
                <AddItemButton />
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
            <div className="hidden flex-1 md:flex">Credential Details</div>
          </div>
        </main>
      </SidebarProvider>
    </RedirectUnauthorizedUser>
  );
};

export default ProtectedLayout;
