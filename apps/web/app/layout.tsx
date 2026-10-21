import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, Source_Serif_4 } from "next/font/google";

import "@repo/ui/globals.css";

import { env } from "@/env";
import { TRPCClientProvider } from "@/lib/trpc/client";

import ThemeProvider from "@repo/ui/components/providers/theme-providers";

const fontSans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});
const fontSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});
const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const description =
  "VaultCore is a zero-knowledge password manager for logins, cards, identities, notes, and SSH keys. Everything is encrypted on your device before it reaches our servers.";

export const metadata: Metadata = {
  title: {
    default: "VaultCore — Zero-knowledge password manager",
    template: "%s · VaultCore",
  },
  description,
  applicationName: "VaultCore",
  category: "security",
  keywords: [
    "password manager",
    "zero-knowledge vault",
    "encrypted password storage",
    "secure notes",
    "SSH key storage",
    "password generator",
  ],
  authors: [{ name: "VaultCore" }],
  creator: "VaultCore",
  publisher: "VaultCore",
  metadataBase: new URL(env.NEXT_PUBLIC_WEB_APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VaultCore — Zero-knowledge password manager",
    description,
    type: "website",
    siteName: "VaultCore",
    locale: "en_US",
    url: env.NEXT_PUBLIC_WEB_APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultCore — Zero-knowledge password manager",
    description,
    site: "@VaultCore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#181818" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-screen w-screen antialiased`}
      >
        <ThemeProvider>
          <TRPCClientProvider>{children}</TRPCClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
