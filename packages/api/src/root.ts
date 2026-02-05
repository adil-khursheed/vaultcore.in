import { authRouter } from "./router/auth";
import { credentialRouter } from "./router/credential";
import { vaultKeyRouter } from "./router/vaultKey";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vault: vaultKeyRouter,
  credential: credentialRouter,
});

export type AppRouter = typeof appRouter;
