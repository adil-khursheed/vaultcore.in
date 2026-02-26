"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "better-auth";

import { useVaultStore } from "@repo/store";

const RedirectUnauthorizedUser = ({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isLocked } = useVaultStore();

  useEffect(() => {
    const user_account = sessionStorage.getItem("user-account");
    const user_email: string | null = user_account
      ? JSON.parse(user_account).email
      : null;

    if (user && !user_email) {
      sessionStorage.setItem(
        "user-account",
        JSON.stringify({
          email: user.email,
          emailVerified: user.emailVerified,
        }),
      );
    }
  }, [user]);

  useEffect(() => {
    if (isLocked) {
      router.push("/lock");
    }
  }, [isLocked, router]);

  return children;
};

export default RedirectUnauthorizedUser;
