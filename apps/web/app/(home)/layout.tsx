import React from "react";
import Navbar from "@/components/shared/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="px-3 w-full overflow-x-hidden">{children}</main>
    </>
  );
};

export default HomeLayout;
