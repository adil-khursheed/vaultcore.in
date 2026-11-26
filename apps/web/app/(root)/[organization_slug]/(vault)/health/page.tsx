import React from "react";

import PasswordHealthDashboard from "./_components/password-health-dashboard";

export const metadata = {
  title: "Password Health - VaultCore",
  description: "Identify weak, reused, and outdated passwords in your vault",
};

export default function PasswordHealthPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <PasswordHealthDashboard />
      </div>
    </div>
  );
}
