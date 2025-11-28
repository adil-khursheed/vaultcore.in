import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="text-lg md:text-2xl font-extrabold text-primary font-serif">
      <span>Vault<span className="text-muted-foreground">Core</span></span>
    </Link>
  );
};

export default Logo;
