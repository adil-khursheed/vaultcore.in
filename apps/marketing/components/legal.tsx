import React from "react";

import SectionContainer from "@repo/site/components/section-container";

export const LegalPage = ({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: React.ReactNode;
}) => {
  return (
    <SectionContainer className="min-h-auto py-16 md:py-24">
      <article className="mx-auto w-full max-w-3xl px-4">
        <h1 className="text-foreground text-3xl font-bold text-balance md:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base text-pretty md:text-lg">
          {description}
        </p>
        <p className="text-muted-foreground/70 mt-3 text-xs">
          Last updated {updated}
        </p>

        <div className="border-border mt-12 flex flex-col border-t">
          {children}
        </div>
      </article>
    </SectionContainer>
  );
};

export const LegalSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="border-border border-b py-10 last:border-b-0">
      <h2 className="text-foreground text-xl font-bold text-balance md:text-2xl">
        {title}
      </h2>
      {/* 65–75ch measure at 15px; lists get their markers from here so page
          content stays plain markup */}
      <div className="text-muted-foreground mt-4 flex flex-col gap-4 text-[15px] leading-relaxed [&_a]:text-foreground hover:[&_a]:underline [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_strong]:text-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
};
