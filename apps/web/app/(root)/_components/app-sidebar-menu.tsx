"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconShieldHalfFilled,
  IconStarFilled,
  IconTrashFilled,
} from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const menuItems = [
  {
    title: "All Items",
    href: "/all-items",
    icon: IconShieldHalfFilled,
  },
  {
    title: "Favorites",
    href: "/favorites",
    icon: IconStarFilled,
  },
  {
    title: "Trash",
    href: "/trash",
    icon: IconTrashFilled,
  },
];

const AppSidebarMenu = () => {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={item.href === pathname}
            tooltip={item.title}
          >
            <Link href={item.href}>
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
