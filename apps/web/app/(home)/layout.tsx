import React from "react";
import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="w-full overflow-x-hidden px-3">{children}</main>
      <Footer />
    </>
  );
};

export default HomeLayout;
