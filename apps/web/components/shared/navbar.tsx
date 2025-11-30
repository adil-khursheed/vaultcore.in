"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import Logo from "./logo";

import ThemeToggle from "@repo/ui/components/theme-toggle";
import { Button } from "@repo/ui/components/button";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-background/30 backdrop-blur-md px-3">
      <div className="flex items-center justify-between py-2.5 max-w-6xl mx-auto w-full">
        <div>
          <Logo />
        </div>

        {!isMobile ? (
          <nav className="flex items-center">
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

            <ThemeToggle />

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
          </nav>
        ) : (
          <div className="flex items-center">
            <ThemeToggle />
            
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
                  
                <nav className="flex flex-col items-start flex-1">
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
                    <Button 
                      asChild 
                      onClick={() => setOpen(false)}
                    >
                      <Link href={"/pricing/personal"}>
                        <span>Get Started Free</span>
                      </Link>
                    </Button>
                  </SheetFooter>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
