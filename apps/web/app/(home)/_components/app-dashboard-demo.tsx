"use client";

import React from "react";
import VaultCore from "@/components/icons/vaultcore";
import {
  IconCopy,
  IconCreditCard,
  IconDots,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconId,
  IconLockPassword,
  IconLogin2,
  IconNotes,
  IconPencil,
  IconPlus,
  IconSearch,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { PanelLeftIcon } from "lucide-react";
import { motion } from "motion/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import ThemeToggle from "@repo/ui/components/theme-toggle";
import { cn } from "@repo/ui/lib/utils";

const credentials = [
  {
    id: 1,
    name: "Google",
    username: "adil.khursheed@gmail.com",
    password: "************",
    url: "https://accounts.google.com",
    favicon: "https://www.google.com/s2/favicons?domain=google.com&sz=64",
    category: "Login",
    lastModified: "2 hours ago",
    created: "Jan 15, 2025",
    notes: "Primary Google account for work and personal use.",
  },
  {
    id: 2,
    name: "GitHub",
    username: "adil-khursheed",
    password: "************",
    url: "https://github.com",
    favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    category: "Login",
    lastModified: "1 day ago",
    created: "Feb 02, 2025",
    notes: "Dev account with 2FA enabled.",
  },
  {
    id: 3,
    name: "Netflix",
    username: "adil.stream@outlook.com",
    password: "************",
    url: "https://netflix.com",
    favicon: "https://www.google.com/s2/favicons?domain=netflix.com&sz=64",
    category: "Login",
    lastModified: "5 days ago",
    created: "Dec 20, 2024",
    notes: "Family plan — Premium 4K.",
  },
  {
    id: 4,
    name: "Spotify",
    username: "adil.music@gmail.com",
    password: "************",
    url: "https://spotify.com",
    favicon: "https://www.google.com/s2/favicons?domain=spotify.com&sz=64",
    category: "Login",
    lastModified: "1 week ago",
    created: "Nov 10, 2024",
    notes: "",
  },
  {
    id: 5,
    name: "AWS Console",
    username: "admin@vaultcore.in",
    password: "************",
    url: "https://aws.amazon.com",
    favicon: "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64",
    category: "Login",
    lastModified: "3 days ago",
    created: "Oct 05, 2024",
    notes: "Production AWS root — MFA required.",
  },
  {
    id: 6,
    name: "Slack",
    username: "adil@vaultcore.in",
    password: "************",
    url: "https://slack.com",
    favicon: "https://www.google.com/s2/favicons?domain=slack.com&sz=64",
    category: "Login",
    lastModified: "12 hours ago",
    created: "Jan 28, 2025",
    notes: "VaultCore workspace.",
  },
  {
    id: 7,
    name: "Vercel",
    username: "adil@vaultcore.in",
    password: "************",
    url: "https://vercel.com",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
    category: "Login",
    lastModified: "4 hours ago",
    created: "Mar 12, 2025",
    notes: "VaultCore production deployments.",
  },
  {
    id: 8,
    name: "Figma",
    username: "adil.design@gmail.com",
    password: "************",
    url: "https://figma.com",
    favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
    category: "Login",
    lastModified: "2 days ago",
    created: "Sep 18, 2024",
    notes: "Design team workspace.",
  },
  {
    id: 9,
    name: "Notion",
    username: "adil.khursheed@gmail.com",
    password: "************",
    url: "https://notion.so",
    favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
    category: "Login",
    lastModified: "6 hours ago",
    created: "Aug 22, 2024",
    notes: "",
  },
];

const AppDashboardDemo = () => {
  const [selectedId, setSelectedId] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const selected = credentials.find((c) => c.id === selectedId)!;

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

          <div className="flex flex-1 flex-col">
            <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-1.5">
              <div className="flex items-center gap-3">
                <PanelLeftIcon className="size-4" />

                <Separator orientation="vertical" className="h-full w-px" />

                <h3 className="text-lg font-medium">All Items</h3>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />

                <Button size={"sm"} variant={"outline"}>
                  <IconPlus className="size-4" />
                  Import CSV
                </Button>
              </div>
            </div>
            <div className="flex h-full flex-1">
              {/* Credential List */}
              <div className="border-border flex h-full w-2/5 flex-col gap-y-4 border-r">
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

                <div className="flex flex-col">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      onClick={() => {
                        setSelectedId(cred.id);
                        setShowPassword(false);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 border-l-2 border-transparent px-3 py-2 transition-colors",
                        cred.id === selectedId
                          ? "border-l-primary bg-accent/50"
                          : "hover:bg-accent/30",
                      )}
                    >
                      <Avatar className="size-7 rounded-md">
                        <AvatarImage
                          src={cred.favicon}
                          alt={cred.name}
                          className="object-contain p-0.5"
                        />
                        <AvatarFallback className="rounded-md text-[10px]">
                          {cred.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-foreground truncate text-sm font-medium">
                          {cred.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {cred.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credential Detail */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Detail Header */}
                <div className="border-border flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage
                        src={selected.favicon}
                        alt={selected.name}
                        className="object-contain p-1"
                      />
                      <AvatarFallback className="rounded-lg text-xs">
                        {selected.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h4 className="text-foreground text-sm font-semibold">
                        {selected.name}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        Modified {selected.lastModified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="size-7">
                      <IconPencil className="size-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7">
                      <IconDots className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Detail Fields */}
                <div className="flex flex-col gap-0.5 p-4">
                  <DetailField label="Username" value={selected.username} />
                  <DetailField
                    label="Password"
                    value={
                      showPassword
                        ? selected.password
                        : "•".repeat(selected.password.length)
                    }
                    mono
                    actions={
                      <button
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <IconEyeOff className="size-3.5" />
                        ) : (
                          <IconEye className="size-3.5" />
                        )}
                      </button>
                    }
                  />
                  <DetailField
                    label="Website"
                    value={selected.url}
                    actions={
                      <IconExternalLink className="text-muted-foreground size-3.5" />
                    }
                  />

                  {selected.notes && (
                    <div className="mt-3">
                      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                        Notes
                      </span>
                      <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                        {selected.notes}
                      </p>
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[10px]">
                      Created {selected.created}
                    </span>
                    <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-medium">
                      {selected.category}
                    </span>
                  </div>
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

function DetailField({
  label,
  value,
  mono = false,
  actions,
}: {
  label: string;
  value: string;
  mono?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="group/field hover:bg-accent/30 flex items-center justify-between rounded-md px-2 py-1.5 transition-colors">
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
          {label}
        </span>
        <p
          className={cn(
            "text-foreground truncate text-xs",
            mono && "font-mono tracking-wider",
          )}
        >
          {value}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/field:opacity-100">
        {actions}
        <IconCopy className="text-muted-foreground hover:text-foreground size-3.5 cursor-pointer transition-colors" />
      </div>
    </div>
  );
}

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
