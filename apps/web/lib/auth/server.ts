import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";

import { initAuth } from "@repo/auth";
import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { organization } from "@repo/db/schema";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: baseUrl,
  extraPlugins: [nextCookies()],
});

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
