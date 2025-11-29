import React from 'react'
import { cn } from '@repo/ui/lib/utils';

const SectionContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <section className={cn("min-h-[calc(100dvh-60px)] w-full relative bg-background flex", className)}>
      {children}
    </section>
  )
}

export default SectionContainer