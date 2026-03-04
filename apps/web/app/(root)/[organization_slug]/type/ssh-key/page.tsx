import React from "react";
import ItemsList from "@/components/shared/items-list";

const Page = () => {
  return (
    <div className="h-full">
      <ItemsList type="ssh_key" />
    </div>
  );
};

export default Page;
