import { NextRequest, NextResponse } from "next/server";

const sessionCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth-session_token",
  "__Secure-better-auth-session_token",
];

// UX hint for the marketing site (vaultcore.in): tells it to render
// "Go to dashboard" instead of "Log in". Not an auth token — the app
// still validates the real session cookie.
const hintCookie = "vc_auth_hint";

export function proxy(request: NextRequest) {
  const hasSessionCookie = sessionCookieNames.some((name) =>
    request.cookies.has(name),
  );

  let response: NextResponse;
  if (request.nextUrl.pathname === "/" && hasSessionCookie) {
    response = NextResponse.redirect(new URL("/app", request.url));
  } else {
    response = NextResponse.next();
  }

  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(hintCookie, hasSessionCookie ? "1" : "", {
    // host-only in dev (localhost), shared across subdomains in prod
    ...(isProd ? { domain: ".vaultcore.in" } : {}),
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: hasSessionCookie ? 60 * 60 * 24 * 30 : 0,
  });

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
