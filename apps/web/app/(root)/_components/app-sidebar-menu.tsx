"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconShieldHalfFilled,
  IconStarFilled,
  IconTrashFilled,
} from "@tabler/icons-react";
import { User } from "better-auth";

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

const AppSidebarMenu = ({ user }: { user: User }) => {
  const pathname = usePathname();

  useEffect(() => {
    const user_account = sessionStorage.getItem("user-account");
    const user_email: string | null = user_account
      ? JSON.parse(user_account).email
      : null;

    if (user && !user_email) {
      sessionStorage.setItem(
        "user-account",
        JSON.stringify({
          email: user.email,
          emailVerified: user.emailVerified,
        }),
      );
    }
  }, [user]);

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
