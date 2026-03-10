import React, { Suspense } from "react";
import { getSession } from "@/lib/auth/server";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@repo/ui/components/sidebar";
import { Skeleton } from "@repo/ui/components/skeleton";

import NavUser from "./app-sidebar-footer/nav-user";
import UpgradePlanButton from "./app-sidebar-footer/upgrade-plan-button";
import AppSidebarHeader from "./app-sidebar-header";
import AppSidebarMenu from "./app-sidebar-menu";
import AppSidebarTypesMenu from "./app-sidebar-types-menu";

const AppSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;

  prefetch(
    trpc.subscription.getPlan.queryOptions({
      organizationId: session.session.activeOrganizationId!,
    }),
  );

  return (
    <HydrateClient>
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
          <SidebarMenu className="gap-3">
            <ErrorBoundary
              fallback={
                <div className="text-sidebar-accent-foreground text-center text-xs font-medium">
                  Unable to fetch current plan
                </div>
              }
            >
              <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <UpgradePlanButton />
              </Suspense>
            </ErrorBoundary>

            <NavUser user={user} />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </HydrateClient>
  );
};

export default AppSidebar;
