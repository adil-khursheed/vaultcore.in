import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";

import type { Auth } from "@repo/auth";
import { initAuth } from "@repo/auth";
import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { organization } from "@repo/db/schema";

const baseUrl = env.WEB_APP_URL.replace(/\/+$/, "");

export const auth = initAuth({
  baseUrl,
  productionUrl: baseUrl,
  extraPlugins: [nextCookies()],
}) as unknown as Auth;

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export const getActiveOrganization = cache(async () => {
  const session = await getSession();

  if (!session) return null;

  if (!session.session.activeOrganizationId) return null;

  const organizationData = await db.query.organization.findFirst({
    where: eq(organization.id, session.session.activeOrganizationId),
  });

  if (!organizationData) return null;

  return organizationData;
});
