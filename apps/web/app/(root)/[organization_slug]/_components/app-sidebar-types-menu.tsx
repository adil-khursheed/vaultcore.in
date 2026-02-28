"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  IconCreditCard,
  IconId,
  IconLogin2,
  IconNotes,
} from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const menuItems = [
  {
    title: "Login",
    href: "/:org_slug/login",
    icon: IconLogin2,
  },
  {
    title: "Card",
    href: "/:org_slug/card",
    icon: IconCreditCard,
  },
  {
    title: "Identity",
    href: "/:org_slug/identity",
    icon: IconId,
  },
  {
    title: "Secure Notes",
    href: "/:org_slug/secure-notes",
    icon: IconNotes,
  },
];

const AppSidebarTypesMenu = () => {
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

export default AppSidebarTypesMenu;
