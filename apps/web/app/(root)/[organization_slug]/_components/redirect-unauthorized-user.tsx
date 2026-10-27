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
  const hasVaultKey = useVaultStore((state) => state.vaultKey !== null);

  useEffect(() => {
    if (!hasVaultKey) {
      router.push("/lock");
    }
  }, [hasVaultKey, router]);

  // Never paint protected UI without a vault key. The store is empty on the
  // server and on a hard reload, so both renders agree and no chrome flashes.
  if (!hasVaultKey) {
    return null;
  }

  return children;
};

export default RedirectUnauthorizedUser;
