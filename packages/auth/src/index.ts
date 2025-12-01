import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@repo/db/client";

import { env } from "../env.ts";
import { hashPasswordForAuth, verifyPasswordForAuth } from "./utils/utils.ts";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.NODE_ENV === "production" ? "production" : "sandbox",
});

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;

  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    plugins: [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: "5c1be1f9-e6e1-4855-a2f6-0559c37d236b",
                slug: "free",
              },
              {
                productId: "f7e1b1b8-225d-4c67-a6fb-9fd79e469678",
                slug: "premium",
              },
            ],
            successUrl: "/success?checkout_id={CHECKOUT_ID}",
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          webhooks({
            secret: env.POLAR_WEBHOOK_SECRET,
            async onSubscriptionActive(payload) {},
          }),
        ],
      }),
      ...(options.extraPlugins ?? []),
    ],
    trustedOrigins: ["exp://"],
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
