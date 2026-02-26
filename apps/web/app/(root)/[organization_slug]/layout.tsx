import React from "react";
import { redirect } from "next/navigation";
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
    <RedirectUnauthorizedUser user={user}>
      <SidebarProvider>
        <AppSidebar user={user} />

        <main className="flex w-full flex-1 flex-col items-start">
          <MainHeader />
          <div className="w-full flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </RedirectUnauthorizedUser>
  );
};

export default ProtectedLayout;
