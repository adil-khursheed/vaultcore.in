import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";

import { Button } from "@repo/ui/components/button";

const LogoutButton = () => {
  return (
    <form>
      <Button
        formAction={async () => {
          "use server";
          await auth.api.signOut({
            headers: await headers(),
          });
          redirect("/");
        }}>
        Logout
      </Button>
    </form>
  );
};

export default LogoutButton;
