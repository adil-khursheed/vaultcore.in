import React from "react";
import Navbar from "@/components/shared/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default HomeLayout;
