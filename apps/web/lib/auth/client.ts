import { env } from "@/env";
import { polarClient } from "@polar-sh/better-auth/client";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { Auth } from "@repo/auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_WEB_APP_URL,
  plugins: [organizationClient(), polarClient(), inferAdditionalFields<Auth>()],
});
