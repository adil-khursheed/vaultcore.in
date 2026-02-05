import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
        }}
        variant={"link"}
      >
        Logout
      </Button>
    </form>
  );
};

export default LogoutButton;
