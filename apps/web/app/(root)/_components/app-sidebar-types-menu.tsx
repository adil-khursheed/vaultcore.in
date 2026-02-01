"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCreditCard,
  IconIdBadge2,
  IconLogin2,
  IconNote,
} from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const menuItems = [
  {
    title: "Login",
    href: "/login",
    icon: IconLogin2,
  },
  {
    title: "Card",
    href: "/card",
    icon: IconCreditCard,
  },
  {
    title: "Identity",
    href: "/identity",
    icon: IconIdBadge2,
  },
  {
    title: "Secure Notes",
    href: "/secure-notes",
    icon: IconNote,
  },
];

const AppSidebarTypesMenu = () => {
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

export default AppSidebarTypesMenu;
