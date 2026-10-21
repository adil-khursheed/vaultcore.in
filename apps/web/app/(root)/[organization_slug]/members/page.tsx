import React from "react";

import MembersList from "./_components/members-list";

const MembersPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Organization Members
            </h2>
            <p className="text-muted-foreground">
              Manage your team members and their access to the organization
              vault.
            </p>
          </div>
          <MembersList />
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
