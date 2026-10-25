"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { IconHistory, IconSettings, IconUsers } from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const menuItems = [
  {
    title: "Members",
    href: "/:org_slug/members",
    icon: IconUsers,
  },
  {
    title: "Audit Log",
    href: "/:org_slug/audit",
    icon: IconHistory,
  },
  {
    title: "Settings",
    href: "/:org_slug/settings",
    icon: IconSettings,
  },
];

const AppSidebarOrgMenu = () => {
  const pathname = usePathname();
  const { organization_slug } = useParams<{ organization_slug: string }>();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={
              item.href.replace(":org_slug", organization_slug) === pathname
            }
            tooltip={item.title}
          >
            <Link href={item.href.replace(":org_slug", organization_slug)}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default AppSidebarOrgMenu;
