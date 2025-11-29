"use client";

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { useRouter } from 'next/navigation';

const tabs = [
    { value: "personal", label: "Personal" },
    { value: "business", label: "Business" },
]

const CategoryTab = ({ category }: { category: string }) => {
    const [activeTab, setActiveTab] = useState(category);

    const router = useRouter();

    return (
        <div>
            <Tabs
                defaultValue={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value)
                    router.push(`/pricing/${value}`)
                }}
                className='relative w-full items-center justify-center'
            >
                <TabsList className='h-12 max-w-3xs w-full mx-auto'>
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    )
}

export default CategoryTab