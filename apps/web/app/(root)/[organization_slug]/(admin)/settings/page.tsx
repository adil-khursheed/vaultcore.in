import React from "react";

import AuditLogs from "./_components/audit-logs";
import SecurityFingerprint from "./_components/security-fingerprint";
import VaultKeyRotation from "./_components/vault-key-rotation";

export const metadata = {
  title: "Settings - VaultCore",
  description: "Manage organization security settings and encryption keys",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your organization&apos;s security settings, encryption keys,
          and audit logs.
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
