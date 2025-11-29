import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="relative text-lg md:text-xl font-extrabold text-primary font-serif">
      <div>
        Vault
        <span className="text-muted-foreground">
          Core
        </span>
      </div>

      <div className="w-full h-3 bg-transparent border border-primary rounded-full flex items-center justify-center">
        <span className="text-primary mt-1 text-sm">
          * * * * *
        </span>
      </div>
    </Link>
  );
};

export default Logo;
