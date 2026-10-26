import type { Metadata } from "next";
import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) redirect("/login");

  return children;
};

export default MainLayout;
