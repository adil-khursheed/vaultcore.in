import { env } from "@/env";

export const siteUrl = env.NEXT_PUBLIC_WEB_APP_URL.replace(/\/+$/, "");
export const gaId = env.NEXT_PUBLIC_GA_ID;
export const gtmId = env.NEXT_PUBLIC_GTM_ID;

export const site = {
  name: "VaultCore",
  url: siteUrl,
  title: "VaultCore — Zero-knowledge password manager",
  description:
    "VaultCore is a zero-knowledge password manager for logins, cards, identities, notes, and SSH keys. Everything is encrypted on your device before it reaches our servers.",
  locale: "en_US",
  twitterHandle: "@VaultCore",
} as const;

export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "VaultCore — the quiet vault for your passwords",
} as const;

export const twitterImage = {
  url: "/twitter-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "VaultCore — the quiet vault for your passwords",
} as const;

export const absoluteUrl = (path = "/") =>
  path === "/" ? siteUrl : new URL(path, `${siteUrl}/`).toString();
