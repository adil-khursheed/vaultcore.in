import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";

import "@repo/ui/globals.css";

import { TRPCClientProvider } from "@/lib/trpc/client";

import ThemeProvider from "@repo/ui/components/providers/theme-providers";

const fontSans = Geist({
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

export const metadata: Metadata = {
  title: "VaultCore",
  description:
    "VaultCore is a secure and reliable password manager and generator. Be it your any valuable credential, store it in vaultcore safely and securely without any worry.",
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
