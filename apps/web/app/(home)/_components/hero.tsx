import React from "react";
import Link from "next/link";
import { IconFingerprint } from "@tabler/icons-react";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import AppDashboardDemo from "./app-dashboard-demo";

const HeroSection = () => {
  return (
    <section className="relative pt-16">
      <div className="flex flex-col items-center justify-center gap-10 text-center">
        <div>
          <div className="bg-accent border-border flex w-max items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md">
            <IconFingerprint className="text-primary size-4" />
            <p className="text-sm font-medium">
              Ultimate Credential Protection
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 px-3">
          <h1 className="text-foreground font-serif text-3xl font-semibold tracking-tight drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl">
            Secure Your Digital Life
            <br />
            <span className="from-primary to-primary/50 bg-linear-to-b bg-clip-text text-transparent">
              Without Compromise
            </span>
          </h1>
          <p className="text-foreground/60 w-full max-w-2xl md:text-xl">
            The next generation of secure storage for your most valuable assets.
            Encrypted, decentralized, and accessible anywhere.
          </p>
        </div>

        <div className="relative w-full">
          <div className="bg-border absolute top-1/2 left-1/2 h-px w-screen -translate-x-1/2 -translate-y-1/2 opacity-50" />
          <div className="relative z-10 flex items-center justify-center gap-4">
            <Button size={"xl"} asChild>
              <Link href={"/pricing/personal"}>Get Started Free</Link>
            </Button>
          </div>

          <div
            className={cn(
              "absolute inset-x-0 top-[22px] h-28",
              "bg-size-[10px_10px]",
              "bg-[radial-gradient(#e5e5e5_1.5px,transparent_1.5px)]",
              "dark:bg-[radial-gradient(#2d2d2d_1.5px,transparent_1.5px)]",
            )}
          >
            <div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center mask-t-from-10%" />
          </div>
        </div>

        <div className="border_top border_bottom bg-background relative hidden aspect-1280/768 w-full md:block">
          <AppDashboardDemo />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
