import { NextRequest, NextResponse } from "next/server";

import { getSession } from "./lib/auth/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicRoute =
    ["/", "/login"].includes(pathname) ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/trpc/auth/");

  const session = await getSession();

  if (session && isPublicRoute) {
    if (session.user.emailVerified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/verify", request.url));
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
