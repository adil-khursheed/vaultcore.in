"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

const tabs = [
  { value: "personal", label: "Personal" },
  // { value: "business", label: "Business" },
];

const CategoryTab = ({ category }: { category: string }) => {
  const [activeTab, setActiveTab] = useState(category);

  const router = useRouter();

  return (
    <div className="bg_pattern border_top border_bottom relative flex h-20 w-full items-center justify-center">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => {
          if (activeTab !== value) {
            setActiveTab(value);
            router.push(`/pricing/${value}`);
          }
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
