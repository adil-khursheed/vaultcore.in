import React from "react";
import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconShieldLock,
} from "@tabler/icons-react";

import { cn } from "@repo/ui/lib/utils";

import Logo from "./logo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
];

const socialLinks = [
  { icon: IconBrandTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: IconBrandGithub, href: "https://github.com", label: "GitHub" },
  { icon: IconBrandLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer className="bg-background border-border border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footerLinks.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h3 className="text-foreground font-semibold">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            {/* <Link href="/" className="flex items-center gap-2">
              <IconShieldLock className="text-primary size-8" />
              <span className="text-foreground text-2xl font-bold">
                VaultCore
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Secure your digital life with the world&apos;s most advanced
              password manager. Zero-knowledge encryption, seamless sync, and
              uncompromising security.
            </p> */}

            <Logo className="h-60" />
          </div>
        </div>

        <div className="border-border mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-muted-foreground text-center text-sm md:text-left">
              &copy; {new Date().getFullYear()} VaultCore. All rights reserved.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
