"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

import { Card, CardContent } from "@repo/ui/components/card";

const items = Array.from({ length: 3 });

const EmptyList = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const duplicateCards = [...items, ...items];
  const cardHeight = 72;
  const totalHeight = items.length * cardHeight;

  return (
    <div className="grid w-full place-items-center">
      <div className="bg-background h-36 w-full max-w-64 overflow-hidden mask-[linear-gradient(transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -totalHeight] }}
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 22,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                }
          }
          className="flex flex-col px-3"
        >
          {duplicateCards.map((_, i) => (
            <Card
              key={`${i}`}
              style={{ height: cardHeight - 16 }}
              className="mt-4 flex items-center rounded-xl py-3 shadow-sm"
            >
              <CardContent className="flex w-full flex-1 items-center justify-between px-3">
                <div className="flex flex-1 items-center gap-3">
                  <div className="bg-accent size-8 rounded-lg"></div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="bg-accent h-2 w-full max-w-28 rounded-full"></div>
                    <div className="bg-accent h-2 w-full max-w-20 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <h2 className="mt-8 text-center text-base font-semibold">
        {title || "Nothing here yet"}
      </h2>
      <p className="text-muted-foreground text-center text-sm text-pretty">
        {subtitle || "Create your first item to get started."}
      </p>
    </div>
  );
};

export default EmptyList;
