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
import { APIError, createAuthMiddleware } from "better-auth/api";
import { organization as organizationPlugin } from "better-auth/plugins";

import { and, eq, gt } from "@repo/db";
import { user, verification } from "@repo/db/auth-schema";
import { db } from "@repo/db/client";

import { env } from "../env.ts";

const vaultVerificationPlugin = () => {
  return {
    id: "vault-verification",
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            const { token, email } = ctx.body as {
              token?: string;
              email?: string;
            };

            if (!token) {
              throw new APIError("BAD_REQUEST", {
                message: "Verification token is required for sign up.",
              });
            }

            // Verify the token in the database
            const record = await db.query.verification.findFirst({
              where: and(
                eq(verification.value, token),
                gt(verification.expiresAt, new Date()),
              ),
            });

            if (!record) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid or expired verification token.",
              });
            }

            // Ensure the email being signed up matches the verified email
            if (record.identifier !== email) {
              throw new APIError("BAD_REQUEST", {
                message:
                  "Email mismatch. Please use the verified email address.",
              });
            }

            return { context: ctx };
          }),
        },
      ],
      after: [
        {
          matcher: (ctx) => ctx.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            const { token } = ctx.body as { token?: string };
            const newSession = ctx.context.newSession as {
              user: { id: string; email: string };
            } | null;

            if (newSession && token) {
              // 1. Mark the user as verified in the database
              await db
                .update(user)
                .set({ emailVerified: true })
                .where(eq(user.id, newSession.user.id));

              // 2. Delete the verification token
              await db
                .delete(verification)
                .where(eq(verification.value, token));
            }

            return { user: ctx.context.newSession?.user };
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};

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
      organizationPlugin(),
      vaultVerificationPlugin(),
      polar({
        client: polarClient,
        createCustomerOnSignUp: false,
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
