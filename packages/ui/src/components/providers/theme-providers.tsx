"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { Toaster } from "../sonner";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
      <ToastProvider />
    </NextThemesProvider>
  );
};

function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

export default ThemeProvider;
