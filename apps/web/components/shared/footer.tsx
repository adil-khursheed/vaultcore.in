import React from "react";
import Link from "next/link";

import Logo from "./logo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Security", href: "/#security" },
      { label: "Pricing", href: "/pricing/personal" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create an account", href: "/signup/free" },
    ],
  },
];

const linkClassName =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative w-fit rounded-sm text-sm outline-none transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-[width] after:duration-300 hover:after:w-full focus-visible:ring-[3px]";

const Footer = () => {
  return (
    <footer className="px-3">
      <div className="bg-background relative mx-auto w-full max-w-6xl overflow-hidden border-r border-l">
        <div className="relative z-10 grid gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr] md:px-10 md:py-16">
          <div className="flex max-w-sm flex-col gap-4">
            <Link
              href="/"
              aria-label="VaultCore home"
              className="focus-visible:ring-ring/50 w-fit rounded-sm outline-none focus-visible:ring-[3px]"
            >
              <Logo className="h-8" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A zero-knowledge vault for the passwords, cards, notes, and keys
              that keep your life running.
            </p>
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-mint size-1.5 rounded-full" />
              Encrypted on your device. Never on our servers.
            </p>
          </div>

          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-muted-foreground text-xs font-medium tracking-[0.1em] uppercase">
                {group.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClassName}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-border relative z-10 flex flex-col gap-2 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} VaultCore. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built to keep secrets quiet.
          </p>
        </div>

        <div
          aria-hidden
          className="border-border relative flex items-end justify-center overflow-hidden border-t"
        >
          <span className="text-foreground/[0.05] translate-y-[18%] font-serif text-[clamp(4rem,16vw,13rem)] leading-[0.78] font-extrabold tracking-tight select-none">
            VaultCore
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
