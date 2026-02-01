"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import ThemeToggle from "@repo/ui/components/theme-toggle";

const MainHeader = () => {
  const path = usePathname();
  const pathname = path.split("/")[1]?.replace("-", " ");

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

      <ThemeToggle />
    </header>
  );
};

export default MainHeader;
