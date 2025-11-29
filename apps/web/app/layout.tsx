import type { Metadata } from "next";
import { Geist, Source_Serif_4, Geist_Mono } from "next/font/google";
import "@repo/ui/globals.css";

import ThemeProvider from "@repo/ui/components/providers/theme-providers";
import { TRPCClientProvider } from "@/lib/trpc/client";

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
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased w-screen min-h-screen`}>
        <ThemeProvider>
          <TRPCClientProvider>{children}</TRPCClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
