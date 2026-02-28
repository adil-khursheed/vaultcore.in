import { authRouter } from "./router/auth";
import { credentialRouter } from "./router/credential";
import { organizationRouter } from "./router/organization";
import { vaultKeyRouter } from "./router/vaultKey";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vault: vaultKeyRouter,
  credential: credentialRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
