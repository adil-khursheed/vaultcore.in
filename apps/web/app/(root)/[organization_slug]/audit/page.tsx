import React from "react";
import AuditList from "./_components/audit-list";

export const metadata = {
  title: "Audit Log - VaultCore",
  description: "View organization activity and audit logs",
};

export default function AuditPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 p-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground text-sm">
          A detailed history of all security events and actions taken within your organization.
        </p>
      </div>

      <div className="space-y-6">
        <AuditList />
      </div>
    </div>
  );
}
