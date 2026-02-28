import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) redirect("/login");

  return children;
};

export default MainLayout;
