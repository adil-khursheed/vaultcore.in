import React from "react";
import Navbar from "@/components/shared/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main className="px-3">{children}</main>
    </div>
  );
};

export default HomeLayout;
