import { NextRequest, NextResponse } from "next/server";

import { getActiveOrganization, getSession } from "./lib/auth/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicRoute =
    ["/", "/login", "/verify"].includes(pathname) ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth/sign-up") ||
    pathname.startsWith("/api/auth/sign-in") ||
    pathname.startsWith("/api/trpc/auth.");

  const session = await getSession();

  if (session && isPublicRoute) {
    const organization = await getActiveOrganization();

    if (!organization) {
      return NextResponse.redirect(
        new URL("/organization/create", request.url),
      );
    }

    return NextResponse.redirect(
      new URL(`/${organization.slug}/all-items`, request.url),
    );
  }

  if (!session && !isPublicRoute && !pathname.startsWith("/pricing")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
