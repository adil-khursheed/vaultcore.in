import React from "react";

import MembersList from "./_components/members-list";

export const metadata = {
  title: "Members - VaultCore",
  description: "Manage organization members and vault access",
};

const MembersPage = () => {
  return <MembersList />;
};

export default MembersPage;
