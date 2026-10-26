import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import BGPattern from "@/components/shared/bg-pattern";
import Footer from "@/components/shared/footer";
import Navbar from "@/components/shared/navbar";
import SectionContainer from "@/components/shared/section-container";

import { Button } from "@repo/ui/components/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: "noindex",
};

const NotFound = () => {
  return (
    <>
      <Navbar />
      <main className="w-full overflow-x-hidden px-3">
        <SectionContainer>
          <div className="relative flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center px-4 py-16">
            <div className="pointer-events-none absolute inset-x-0 top-0">
              <BGPattern />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0">
              <BGPattern />
            </div>

            <div className="relative flex flex-col items-center text-center">
              <span
                aria-hidden
                className="text-foreground/[0.08] font-serif text-[clamp(6rem,22vw,12rem)] leading-none font-extrabold tracking-tight select-none"
              >
                404
              </span>

              <h1 className="text-foreground mt-4 text-2xl font-bold text-balance md:text-3xl">
                This page isn&apos;t in the vault.
              </h1>
              <p className="text-muted-foreground mt-3 max-w-md text-base leading-relaxed text-pretty">
                The link may be old, or the page may have moved. Nothing you
                stored is affected.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/">Back to home</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/pricing/personal">View pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
