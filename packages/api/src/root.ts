import { auditRouter } from "./router/audit";
import { authRouter } from "./router/auth";
import { credentialRouter } from "./router/credential";
import { migrationRouter } from "./router/migration";
import { subscriptionRouter } from "./router/subscription";
import { vaultKeyRouter } from "./router/vaultKey";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vault: vaultKeyRouter,
  credential: credentialRouter,
  subscription: subscriptionRouter,
  migration: migrationRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
