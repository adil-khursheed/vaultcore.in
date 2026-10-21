import { waitUntil } from "@vercel/functions";

import { db } from "@repo/db/client";
import { auditLog } from "@repo/db/schema";

export type AuditAction =
  | "vault_key_granted"
  | "vault_key_revoked"
  | "vault_key_rotated"
  | "member_invited"
  | "member_accepted"
  | "member_removed"
  | "credential_created"
  | "credential_updated"
  | "credential_deleted"
  | "vault_unlocked"
  | "vault_locked"
  | "user_keys_migrated"
  | "login_success"
  | "login_failed";

interface AuditEventParams {
  organizationId?: string | null;
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Log an audit event to the database asynchronously via `waitUntil`.
 *
 * Uses Vercel's `waitUntil()` to schedule the DB insert after the
 * response is sent. This gives us:
 *
 * - **Zero added latency** — the response is returned immediately
 * - **Guaranteed delivery** — unlike fire-and-forget, `waitUntil`
 *   extends the serverless function lifetime until the promise
 *   resolves, so the insert always completes
 * - **No infrastructure overhead** — no Redis/BullMQ/pg-boss needed
 *
 * Errors are caught internally to prevent audit failures from
 * surfacing as unhandled rejections.
 */
export function logAuditEvent(params: AuditEventParams): void {
  waitUntil(
    db
      .insert(auditLog)
      .values({
        organizationId: params.organizationId ?? null,
        actorUserId: params.actorUserId ?? null,
        targetUserId: params.targetUserId ?? null,
        action: params.action,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      })
      .catch((error) => {
        console.error("[AUDIT] Failed to log event:", params.action, error);
      }),
  );
}
