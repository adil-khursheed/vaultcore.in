import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, Source_Serif_4 } from "next/font/google";

import "@repo/ui/globals.css";

import { ogImage, site, twitterImage } from "@/lib/seo";

import ConsentBanner from "@repo/site/components/consent-banner";
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

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  category: "security",
  keywords: [
    "password manager",
    "best password manager",
    "free password manager",
    "password manager app",
    "zero-knowledge password manager",
    "encrypted password storage",
    "password generator",
    "password autofill",
    "password manager for families",
    "1Password alternative",
    "Bitwarden alternative",
    "LastPass alternative",
    "secure notes",
    "SSH key storage",
    "password vault",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    site: site.twitterHandle,
    images: [twitterImage],
  },
  robots: isProduction
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
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
        {gtmId || gaId ? (
          <ConsentBanner gaId={gaId} gtmId={gtmId} />
        ) : null}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
