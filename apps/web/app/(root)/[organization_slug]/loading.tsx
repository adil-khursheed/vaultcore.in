import React from "react";
import { Loader2 } from "lucide-react";

const loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="text-primary size-10 animate-spin" />
    </div>
  );
};

export default loading;
