"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";

import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import ThemeToggle from "@repo/ui/components/theme-toggle";

import ImportCSV from "./import-csv";

const sectionTitles: Record<string, string> = {
  "all-items": "All Items",
  favorites: "Favorites",
  trash: "Trash",
  login: "Logins",
  card: "Cards",
  identity: "Identities",
  "secure-note": "Secure Notes",
  "ssh-key": "SSH Keys",
  members: "Members",
  audit: "Audit Log",
  settings: "Settings",
};

const adminSections = new Set(["members", "audit", "settings"]);

const MainHeader = () => {
  const pathname = usePathname();
  const pathArray = pathname.split("/").filter(Boolean);
  const section = pathArray[1] ?? "all-items";
  const type = pathArray[2];
  const title = sectionTitles[type ?? section] ?? "Vault";
  const isAdminRoute = adminSections.has(section);

  const { data: organization } = authClient.useActiveOrganization();

  return (
    <header className="border-border flex h-12 w-full shrink-0 items-center justify-between gap-4 border-b px-3">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />

        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4"
        />

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm"
        >
          {organization?.name && (
            <>
              <span className="text-muted-foreground hidden truncate sm:inline">
                {organization.name}
              </span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
            </>
          )}
          <span className="truncate font-medium">{title}</span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />

        {!isAdminRoute && <ImportCSV />}
      </div>
    </header>
  );
};

export default MainHeader;
