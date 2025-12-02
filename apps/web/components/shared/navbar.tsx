"use client";

import React, { useState } from "react";
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

import Logo from "./logo";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const isMobile = useIsMobile();

  return (
    <header className="bg-background/30 sticky inset-x-0 top-0 z-50 px-3 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between py-2.5">
        <div>
          <Logo />
        </div>

        {!isMobile ? (
          <nav className="flex items-center">
            {!pathname.startsWith("/verify") && (
              <>
                <Button asChild variant={"ghost"}>
                  <Link href={"/pricing/personal"}>
                    <span>Pricing</span>
                  </Link>
                </Button>
                <Button asChild variant={"ghost"}>
                  <Link href={"/downloads"}>
                    <span>Downloads</span>
                  </Link>
                </Button>
              </>
            )}

            <ThemeToggle />

            {!pathname.startsWith("/verify") && (
              <>
                <Button asChild variant={"ghost"}>
                  <Link href={"/login"}>
                    <span>Login</span>
                  </Link>
                </Button>

                <Button asChild className="ml-3">
                  <Link href={"/pricing/personal"}>
                    <span>Get Started Free</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        ) : (
          <div className="flex items-center">
            <ThemeToggle />

            {!pathname.startsWith("/verify") && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant={"ghost"}>
                    <Menu />
                  </Button>
                </SheetTrigger>

                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Mobile Menu
                    </SheetDescription>

                    <div />
                  </SheetHeader>

                  <nav className="flex flex-1 flex-col items-start">
                    <Button
                      asChild
                      variant={"ghost"}
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={"/pricing/personal"}>
                        <span>Pricing</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant={"ghost"}
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={"/downloads"}>
                        <span>Downloads</span>
                      </Link>
                    </Button>

                    <SheetFooter className="mt-auto w-full">
                      <Button
                        asChild
                        variant={"outline"}
                        onClick={() => setOpen(false)}
                      >
                        <Link href={"/login"}>
                          <span>Login</span>
                        </Link>
                      </Button>
                      <Button asChild onClick={() => setOpen(false)}>
                        <Link href={"/pricing/personal"}>
                          <span>Get Started Free</span>
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
