import { auth } from "@/lib/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

import { and, eq } from "@repo/db";
import { db } from "@repo/db/client";
import { member } from "@repo/db/schema";

const { POST: authPOST, GET } = toNextJsHandler(auth);

export { GET };

export async function POST(request: Request) {
  const pathname = new URL(request.url).pathname;

  if (!pathname.replace(/\/+$/, "").endsWith("/checkout")) {
    return authPOST(request);
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return authPOST(request);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.clone().json()) as Record<string, unknown>;
  } catch {
    return authPOST(request);
  }

  const metadata =
    body.metadata && typeof body.metadata === "object"
      ? (body.metadata as Record<string, unknown>)
      : {};

  const referenceId =
    typeof body.referenceId === "string"
      ? body.referenceId
      : typeof metadata.referenceId === "string"
        ? metadata.referenceId
        : typeof metadata.organizationId === "string"
          ? metadata.organizationId
          : null;

  if (!referenceId) {
    return authPOST(request);
  }

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, referenceId),
      eq(member.userId, session.user.id),
    ),
  });

  if (!membership) {
    return Response.json(
      { message: "You are not a member of this organization" },
      { status: 403 },
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("content-length");

  const rewritten = new Request(request.url, {
    method: request.method,
    headers,
    body: JSON.stringify({
      ...body,
      referenceId,
      metadata: {
        ...metadata,
        referenceId,
        organizationId: referenceId,
        userId: session.user.id,
      },
    }),
  });

  return authPOST(rewritten);
}
