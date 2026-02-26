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
    <footer className="px-3">
      <div className="text-foreground bg-background relative mx-auto min-h-[350px] w-full max-w-6xl overflow-hidden border-r border-l">
        <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-serif text-[280px] leading-0 font-extrabold opacity-5">
          VaultCore
        </span>
      </div>
    </footer>
  );
};

export default Footer;
