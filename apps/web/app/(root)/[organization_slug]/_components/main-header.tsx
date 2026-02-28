"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AddItemButton from "@/components/shared/add-item-button";

import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import ThemeToggle from "@repo/ui/components/theme-toggle";

const MainHeader = () => {
  const path = usePathname();
  const pathname = path.split("/")[2]?.replace("-", " ");

  return (
    <header className="flex h-12 w-full items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4"
        />

        <div>
          <h3 className="text-base font-medium capitalize">{pathname}</h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <AddItemButton />
      </div>
    </header>
  );
};

export default MainHeader;
