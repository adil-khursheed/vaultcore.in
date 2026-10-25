import React from "react";
import AddItemButton from "@/components/shared/add-item-button";
import SearchInput from "@/components/shared/search-input";

import { Sheet } from "@repo/ui/components/sheet";

import CredentialDetails from "../_components/credential-comps/credential-details";

const VaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      <Sheet>
        <div className="border-border flex h-full min-h-0 w-full flex-col border-r md:w-2/5">
          <div className="flex shrink-0 items-center gap-2 px-3 pt-3 pb-2">
            <SearchInput />
            <AddItemButton />
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </div>

        <CredentialDetails />
      </Sheet>
    </div>
  );
};

export default VaultLayout;
