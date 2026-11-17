"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

import { siteUrl } from "@repo/site/config";

export const logout = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  // The dash root ("/") only funnels to /app or /login — the real homepage
  // is the marketing site.
  redirect(siteUrl);
};
