import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    plugins: [polarClient()],
  },
);
