import React from "react";
import Link from "next/link";
import { IconFingerprint } from "@tabler/icons-react";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

import SectionContainer from "./_components/section-container";

const Page = () => {
  return (
    <SectionContainer>
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="flex flex-col items-center justify-center gap-10 text-center">
          <div>
            <div className="bg-background/10 border-border flex w-max items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md">
              <IconFingerprint className="text-chart-2 size-4" />
              <p className="text-sm font-medium">
                Ultimate Credential Protection
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 px-3">
            <h1 className="text-foreground text-3xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
              Secure Your Digital Life
              <br />
              <span className="text-muted-foreground">Without Compromise</span>
            </h1>
            <p className="text-foreground/60 w-full max-w-2xl md:text-xl">
              The next generation of secure storage for your most valuable
              assets. Encrypted, decentralized, and accessible anywhere.
            </p>
          </div>

          <div className="relative w-full">
            <div className="bg-border absolute top-1/2 left-1/2 h-px w-screen -translate-x-1/2 -translate-y-1/2 opacity-50" />
            <div className="relative z-10 flex items-center justify-center gap-4">
              <Button size={"xl"} asChild>
                <Link href={"/pricing/personal"}>Get Started Free</Link>
              </Button>
              <Button
                variant={"outline"}
                size={"xl"}
                className="dark:bg-input dark:hover:bg-input/90"
              >
                Learn More
              </Button>
            </div>

            <div
              className={cn(
                "absolute inset-x-0 top-[20px] h-[150px]",
                "bg-size-[13px_13px]",
                "bg-[radial-gradient(#e5e5e5_1.5px,transparent_1.5px)]",
                "dark:bg-[radial-gradient(#2d2d2d_1.5px,transparent_1.5px)]",
              )}
            >
              <div className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center mask-t-from-5%" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid Style) */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-8">
          <div className="group bg-card relative overflow-hidden rounded-2xl border p-6 md:col-span-2 md:row-span-2">
            <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-2xl font-bold">Advanced Encryption</h3>
            <p className="text-muted-foreground mt-2">
              Military-grade AES-256 encryption ensures your data remains yours
              alone. We utilize zero-knowledge architecture.
            </p>
            <div className="bg-muted/50 mt-8 h-48 w-full rounded-lg" />
          </div>
          <div className="group bg-card relative overflow-hidden rounded-2xl border p-6">
            <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-xl font-bold">Instant Sync</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Changes reflect across all your devices in milliseconds.
            </p>
          </div>
          <div className="group bg-card relative overflow-hidden rounded-2xl border p-6">
            <div className="from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h3 className="text-xl font-bold">Team Collaboration</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Securely share vaults with granular permission controls.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Why Choose VaultCore?
              </h2>
              <ul className="space-y-4">
                {[
                  "Zero-knowledge privacy architecture",
                  "Cross-platform availability (iOS, Android, Web)",
                  "Biometric authentication support",
                  "Automated backups and version history",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                      ✓
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="from-primary/20 via-background to-primary/10 aspect-video w-full rounded-xl bg-linear-to-tr shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-bold">Product</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="hover:text-foreground cursor-pointer">Features</li>
              <li className="hover:text-foreground cursor-pointer">Security</li>
              <li className="hover:text-foreground cursor-pointer">
                Enterprise
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Company</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="hover:text-foreground cursor-pointer">About Us</li>
              <li className="hover:text-foreground cursor-pointer">Careers</li>
              <li className="hover:text-foreground cursor-pointer">Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Legal</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="hover:text-foreground cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-foreground cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">VaultCore</h4>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} VaultCore Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </SectionContainer>
  );
};

export default Page;
