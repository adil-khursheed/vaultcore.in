import React from "react";
import { redirect } from "next/navigation";
import SectionContainer from "@/components/shared/section-container";
import { getSession } from "@/lib/auth/server";

import AllItemsList from "./_components/all-items-list";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <SectionContainer>
      <AllItemsList />
    </SectionContainer>
  );
};

export default Page;
