"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

const tabs = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
];

const CategoryTab = ({ category }: { category: string }) => {
  const [activeTab, setActiveTab] = useState(category);

  const router = useRouter();

  return (
    <div className="before:bg-border after:bg-border relative flex h-20 w-full items-center justify-center bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed [--pattern-fg:var(--color-border)]/50 before:absolute before:top-0 before:left-1/2 before:z-10 before:h-px before:w-[200%] before:-translate-x-1/2 before:opacity-50 after:absolute after:bottom-0 after:left-1/2 after:z-10 after:h-px after:w-[200%] after:-translate-x-1/2 after:opacity-50">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          router.push(`/pricing/${value}`);
        }}
        className="relative w-full items-center justify-center"
      >
        <TabsList className="mx-auto h-12 w-full max-w-xs rounded-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTab;
