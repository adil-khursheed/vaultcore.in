import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@repo/db/client";
import { hashPasswordForAuth, verifyPasswordForAuth } from "./utils/utils.ts";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;

  googleClientId: string;
  googleClientSecret: string;

  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    plugins: [...(options.extraPlugins ?? [])],
    trustedOrigins: ["exp://"],
    emailVerification: {
      sendOnSignUp:true,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      password: {
        async hash(password) {
          return hashPasswordForAuth(password);
        },
        async verify({ password, hash }) {
          return verifyPasswordForAuth(password, hash);
        },
      },
    },
    socialProviders: {
      google: {
        clientId: options.googleClientId,
        clientSecret: options.googleClientSecret,
        redirectURI: `${options.productionUrl}/api/auth/callback/google`,
      },
    },
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];
