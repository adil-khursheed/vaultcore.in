import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "@repo/ui/globals.css";

import ThemeProvider from "@repo/ui/components/providers/theme-providers";
import { TRPCClientProvider } from "@/lib/trpc/client";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});
const fontSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});
const fontMono = JetBrains_Mono({
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
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider>
          <TRPCClientProvider>{children}</TRPCClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
