"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  IconLockPassword,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const menuItems = [
  {
    title: "All Items",
    href: "/:org_slug/all-items",
    icon: IconLockPassword,
  },
  {
    title: "Favorites",
    href: "/:org_slug/favorites",
    icon: IconStarFilled,
  },
  {
    title: "Trash",
    href: "/:org_slug/trash",
    icon: IconTrash,
  },
];

const AppSidebarMenu = () => {
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

export default AppSidebarMenu;
