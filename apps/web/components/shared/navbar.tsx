import React from "react";
import Logo from "./logo";
import ThemeToggle from "@repo/ui/components/theme-toggle";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 shadow-sm bg-background/50 backdrop-blur-md px-3">
      <div className="flex items-center justify-between py-2.5">
        <div>
          <Logo />
        </div>

        <nav className="flex items-center gap-3">
          <ThemeToggle />

          <Button asChild variant={"ghost"}>
            <Link href={"/login"}>
              <span>Login</span>
            </Link>
          </Button>

          <Button asChild>
            <Link href={"/signup"}>
              <span>Get Started</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
