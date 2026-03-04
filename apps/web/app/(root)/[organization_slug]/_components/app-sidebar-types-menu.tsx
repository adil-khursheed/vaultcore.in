"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  IconCreditCard,
  IconId,
  IconKey,
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
    href: "/:org_slug/type/login",
    icon: IconLogin2,
  },
  {
    title: "Card",
    href: "/:org_slug/type/card",
    icon: IconCreditCard,
  },
  {
    title: "Identity",
    href: "/:org_slug/type/identity",
    icon: IconId,
  },
  {
    title: "Secure Notes",
    href: "/:org_slug/type/secure-note",
    icon: IconNotes,
  },
  {
    title: "SSH Key",
    href: "/:org_slug/type/ssh-key",
    icon: IconKey,
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
