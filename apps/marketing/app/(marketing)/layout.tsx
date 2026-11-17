import React from "react";
import { cookies } from "next/headers";

import Footer from "@repo/site/components/footer";
import Navbar from "@repo/site/components/navbar";

const MarketingLayout = async ({ children }: { children: React.ReactNode }) => {
  // Set by dash.vaultcore.in when a session cookie exists. A UX hint only.
  const signedIn =
    (await cookies()).get("vc_auth_hint")?.value === "1";

  return (
    <>
      <Navbar signedIn={signedIn} />
      <main className="w-full overflow-x-hidden px-3">{children}</main>
      <Footer />
    </>
  );
};

export default MarketingLayout;
