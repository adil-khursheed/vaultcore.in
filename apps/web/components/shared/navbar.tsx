"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import ThemeToggle from "@repo/ui/components/theme-toggle";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { cn } from "@repo/ui/lib/utils";

import Logo from "./logo";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();

  const isMobile = useIsMobile();

  const isPricing = pathname.startsWith("/pricing");
  const showNavigation =
    !pathname.startsWith("/verify") &&
    !pathname.startsWith("/lock") &&
    !pathname.startsWith("/organization");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-50 px-3 transition-[background-color,border-color,box-shadow] duration-300",
        "bg-background/40 backdrop-blur-md",
        scrolled && "bg-background/85 border-border border-b shadow-xs",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between py-2.5">
        <Link
          href="/"
          aria-label="VaultCore home"
          className="focus-visible:ring-ring/50 rounded-sm transition-opacity duration-200 outline-none hover:opacity-80 focus-visible:ring-[3px]"
        >
          <Logo />
        </Link>

        {!isMobile ? (
          <nav className="flex items-center" aria-label="Primary">
            <ThemeToggle />

            {showNavigation && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    isPricing && "bg-accent text-accent-foreground",
                  )}
                >
                  <Link
                    href="/pricing/personal"
                    aria-current={isPricing ? "page" : undefined}
                  >
                    <span>Pricing</span>
                  </Link>
                </Button>

                <Button asChild variant="ghost">
                  <Link href="/login">
                    <span>Log in</span>
                  </Link>
                </Button>

                <Button asChild className="ml-3">
                  <Link href="/pricing/personal">
                    <span>Get started free</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        ) : (
          <div className="flex items-center">
            <ThemeToggle />

            {showNavigation && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" aria-label="Open menu">
                    <Menu />
                  </Button>
                </SheetTrigger>

                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      VaultCore navigation
                    </SheetDescription>

                    <Link
                      href="/"
                      aria-label="VaultCore home"
                      onClick={() => setOpen(false)}
                      className="w-fit"
                    >
                      <Logo />
                    </Link>
                  </SheetHeader>

                  <nav
                    className="flex flex-1 flex-col items-start"
                    aria-label="Mobile"
                  >
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/pricing/personal">
                        <span>Pricing</span>
                      </Link>
                    </Button>

                    <SheetFooter className="mt-auto w-full">
                      <p className="text-muted-foreground px-1 pb-2 text-xs">
                        Zero-knowledge encryption, on every plan.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/login">
                          <span>Log in</span>
                        </Link>
                      </Button>
                      <Button asChild onClick={() => setOpen(false)}>
                        <Link href="/pricing/personal">
                          <span>Get started free</span>
                        </Link>
                      </Button>
                    </SheetFooter>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
