import React from "react";

import MembersList from "./_components/members-list";

export const metadata = {
  title: "Members - VaultCore",
  description: "Manage organization members and vault access",
};

const MembersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage your team members and their access to the organization vault.
        </p>
      </div>

      <MembersList />
    </div>
  );
};

export default MembersPage;
