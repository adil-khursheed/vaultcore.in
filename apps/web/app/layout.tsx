import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, Source_Serif_4 } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import "@repo/ui/globals.css";

import { gaId, gtmId, ogImage, site, twitterImage } from "@/lib/seo";
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

const description = site.description;

const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description,
  applicationName: site.name,
  category: "security",
  keywords: [
    "password manager",
    "zero-knowledge vault",
    "encrypted password storage",
    "secure notes",
    "SSH key storage",
    "password generator",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.title,
    description,
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description,
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
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        <ThemeProvider>
          <TRPCClientProvider>{children}</TRPCClientProvider>
        </ThemeProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
