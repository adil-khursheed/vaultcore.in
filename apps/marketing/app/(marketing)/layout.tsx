import React from "react";

import Footer from "@repo/site/components/footer";
import Navbar from "@repo/site/components/navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="w-full overflow-x-hidden px-3">{children}</main>
      <Footer />
    </>
  );
};

export default MarketingLayout;
