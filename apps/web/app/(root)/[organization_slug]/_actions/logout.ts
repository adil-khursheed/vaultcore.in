"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

import { siteUrl } from "@repo/site/config";

// Same attributes the proxy uses, so the browser matches and deletes it.
const clearHintCookie = async () => {
  const isProd = process.env.NODE_ENV === "production";
  (await cookies()).set("vc_auth_hint", "", {
    ...(isProd ? { domain: ".vaultcore.in" } : {}),
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: 0,
  });
};

export const logout = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  // The redirect leaves this origin, so the proxy never runs again to
  // clear the marketing-site hint — clear it on this response instead.
  await clearHintCookie();

  // The dash root ("/") only funnels to /app or /login — the real homepage
  // is the marketing site.
  redirect(siteUrl);
};
