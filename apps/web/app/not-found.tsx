import type { Metadata } from "next";
import React from "react";

import NotFound from "@repo/site/components/not-found";

export const metadata: Metadata = {
  title: "Page not found",
  robots: "noindex",
};

const Page = () => <NotFound />;

export default Page;
