"use client";

import React from "react";
import VaultCore from "@/components/icons/vaultcore";
import {
  IconCreditCard,
  IconId,
  IconLockPassword,
  IconLogin2,
  IconNotes,
  IconPlus,
  IconSearch,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { PanelLeftIcon } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@repo/ui/lib/utils";

const AppDashboardDemo = () => {
  return (
    <>
      <motion.div
        initial={{
          y: 10,
          filter: "blur(10px)",
          opacity: 0,
        }}
        animate={{
          y: 0,
          filter: "blur(0px)",
          opacity: 1,
          transition: { duration: 0.5 },
        }}
        className="bg-background flex h-full w-full flex-col"
      >
        <div className="border-border/60 flex w-full border-b p-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500" />
            <span className="size-2.5 rounded-full bg-yellow-500" />
            <span className="size-2.5 rounded-full bg-green-500" />
          </div>
        </div>

        <div className="flex flex-1">
          <div className="bg-sidebar text-sidebar-foreground flex h-full w-1/5 flex-col">
            <div className="flex items-center justify-between p-2">
              <VaultCore className="size-7" />

              <PanelLeftIcon className="size-4" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div className="flex w-full min-w-0 flex-col gap-1 px-1 py-2">
                <MenuItem
                  icon={<IconLockPassword className="size-4" />}
                  label="All Items"
                  isActive
                />
                <MenuItem
                  icon={<IconStarFilled className="size-4" />}
                  label="Favorites"
                />
                <MenuItem
                  icon={<IconTrash className="size-4" />}
                  label="Trash"
                />
              </div>

              <div className="flex w-full min-w-0 flex-col gap-1 px-1 py-2">
                <div className="text-sidebar-foreground/70 flex h-8 justify-start px-2 text-xs font-medium">
                  <span>Types</span>
                </div>
                <MenuItem
                  icon={<IconLogin2 className="size-4" />}
                  label="Login"
                />
                <MenuItem
                  icon={<IconCreditCard className="size-4" />}
                  label="Card"
                />
                <MenuItem
                  icon={<IconId className="size-4" />}
                  label="Identity"
                />
                <MenuItem
                  icon={<IconNotes className="size-4" />}
                  label="Secure Notes"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1">
            <div className="border-border h-full w-2/5 border-r">
              <div className="flex items-center gap-2 p-2">
                <div className="bg-accent border-input flex h-9 flex-1 items-center gap-2 rounded-md border px-2 py-1.5 shadow-xs">
                  <IconSearch className="size-4" />
                  <span className="text-muted-foreground text-sm">
                    Search vault
                  </span>
                </div>

                <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
                  <IconPlus className="size-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center mask-t-from-10%" />
    </>
  );
};

export default AppDashboardDemo;

function MenuItem({
  icon,
  label,
  isActive = false,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2",
        isActive &&
          "bg-sidebar-accent/50 text-sidebar-accent-foreground rounded border backdrop-blur-md",
      )}
    >
      {icon}
      <span className="text-sm font-light">{label}</span>
    </div>
  );
}
