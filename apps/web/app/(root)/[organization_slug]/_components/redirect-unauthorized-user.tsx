"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useVaultStore } from "@repo/store";

const RedirectUnauthorizedUser = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isLocked } = useVaultStore();

  useEffect(() => {
    if (isLocked) {
      router.push("/lock");
    }
  }, [isLocked, router]);

  return children;
};

export default RedirectUnauthorizedUser;
