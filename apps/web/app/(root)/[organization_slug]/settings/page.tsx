import React from "react";
import VaultKeyRotation from "./_components/vault-key-rotation";
import AuditLogs from "./_components/audit-logs";
import SecurityFingerprint from "./_components/security-fingerprint";

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization's security settings, encryption keys, and
          audit logs.
        </p>
      </div>

      <div className="space-y-6">
        <SecurityFingerprint />
        <VaultKeyRotation />
        <AuditLogs />
      </div>
    </div>
  );
}
