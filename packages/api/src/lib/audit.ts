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
 * Log an audit event without blocking the response.
 *
 * VaultCore runs on a long-lived Node.js process on EC2, so the insert
 * continues after the response is sent. On serverless platforms, replace
 * this with the platform's request-lifetime extension API.
 *
 * Errors are caught internally to prevent audit failures from
 * surfacing as unhandled rejections.
 */
export function logAuditEvent(params: AuditEventParams): void {
  void db
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
    });
}
