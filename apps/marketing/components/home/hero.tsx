import React from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

import { Button } from "@repo/ui/components/button";

import AppDashboardDemo from "./app-dashboard-demo";

const trustFacts = [
  "Free plan available",
  "AES-256-GCM encryption",
  "No plaintext on our servers",
];

const HeroSection = () => {
  return (
    <section className="relative pt-16 md:pt-24" aria-labelledby="hero-heading">
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        <div className="flex max-w-3xl flex-col items-center gap-6 px-4">
          <h1
            id="hero-heading"
            className="text-foreground text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The quiet vault for{" "}
            <span className="text-muted-foreground">your passwords.</span>
          </h1>

          <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty md:text-lg">
            VaultCore is a zero-knowledge password manager for logins, cards,
            identities, notes, and SSH keys. Everything is encrypted on your
            device — we never see the plaintext.
          </p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="xl" asChild className="group/cta">
              <Link href="/pricing/personal">
                Create your free vault
                <IconArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" />
              </Link>
            </Button>

            <Button size="xl" variant="ghost" asChild>
              <Link href="#features">Explore features</Link>
            </Button>
          </div>

          <ul className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {trustFacts.map((fact) => (
              <li key={fact} className="flex items-center gap-1.5">
                <IconCheck className="text-mint size-3.5" aria-hidden />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figure
        className="border_top border_bottom bg-background relative mt-12 hidden aspect-1280/768 w-full md:block"
        aria-label="Preview of the VaultCore vault interface"
      >
        <AppDashboardDemo />
      </figure>
    </section>
  );
};

export default HeroSection;
