import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="text-base md:text-xl font-extrabold text-primary">
      <span>VaultCore</span>
    </Link>
  );
};

export default Logo;
