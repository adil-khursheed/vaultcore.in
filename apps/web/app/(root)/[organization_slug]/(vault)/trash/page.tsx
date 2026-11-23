import React from "react";
import ItemsList from "@/components/shared/items-list";

import EmptyTrash from "../../_components/empty-trash";

const Page = () => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 justify-end border-b px-3 py-2">
        <EmptyTrash />
      </div>

      <div className="min-h-0 flex-1">
        <ItemsList isDeleted={true} />
      </div>
    </div>
  );
};

export default Page;
