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
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
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

const PREMIUM_PRODUCT_ID = env.POLAR_PREMIUM_PRODUCT_ID;
const FAMILY_PRODUCT_ID = env.POLAR_FAMILY_PRODUCT_ID;

type SubscriptionTier = "free" | "premium" | "family";

// Tier limits
const LIMITS: Record<
  SubscriptionTier,
  { maxOrgs: number | null; maxMembers: number | null }
> = {
  free: { maxOrgs: 1, maxMembers: 2 },
  premium: { maxOrgs: 2, maxMembers: 3 },
  family: { maxOrgs: null, maxMembers: 10 }, // null means unlimited
};

/**
 * Get a user's active subscription tier via the Polar API.
 */
async function getSubscriptionTier(
  userEmail: string,
): Promise<SubscriptionTier> {
  try {
    // Look up the Polar customer by email
    const customers = await polarClient.customers.list({ email: userEmail });

    const customer = customers.result.items[0];
    if (!customer) return "free";

    // Check for active subscriptions for this customer
    const subscriptions = await polarClient.subscriptions.list({
      customerId: customer.id,
      active: true,
    });

    const activeSubscriptions = subscriptions.result.items;

    // Check highest tier first
    const hasFamily = activeSubscriptions.some(
      (sub) => sub.productId === FAMILY_PRODUCT_ID,
    );
    if (hasFamily) return "family";

    const hasPremium = activeSubscriptions.some(
      (sub) => sub.productId === PREMIUM_PRODUCT_ID,
    );
    if (hasPremium) return "premium";

    return "free";
  } catch (error) {
    console.error("Error checking subscription tier:", error);
    // Fail-open: if we can't reach Polar, don't block the user (assume highest tier to prevent breaking app)
    return "family";
  }
}

const subscriptionLimitsPlugin = () => {
  return {
    id: "subscription-limits",
    hooks: {
      before: [
        {
          // Restrict organization creation based on plan
          matcher: (ctx) => ctx.path === "/organization/create",
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) {
              throw new APIError("UNAUTHORIZED", {
                message: "You must be logged in to create an organization.",
              });
            }

            const tier = await getSubscriptionTier(session.user.email);
            const limit = LIMITS[tier].maxOrgs;

            if (limit !== null) {
              // Count how many orgs the user is already an owner of
              const memberships = await ctx.context.adapter.findMany<{
                role: string;
              }>({
                model: "member",
                where: [
                  { field: "userId", value: session.user.id },
                  { field: "role", value: "owner" },
                ],
              });

              if (memberships.length >= limit) {
                const planName = tier.charAt(0).toUpperCase() + tier.slice(1);
                throw new APIError("FORBIDDEN", {
                  message: `${planName} plan allows only ${limit} organization${limit > 1 ? "s" : ""}. Please upgrade to create more.`,
                });
              }
            }

            return { context: ctx };
          }),
        },
        {
          // Restrict member invitations based on plan
          matcher: (ctx) => ctx.path === "/organization/invite-member",
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session) {
              throw new APIError("UNAUTHORIZED", {
                message: "You must be logged in to invite members.",
              });
            }

            const { organizationId } = ctx.body as {
              organizationId?: string;
            };

            // Use the provided org ID or fall back to the active organization
            const orgId =
              organizationId ?? session.session.activeOrganizationId;

            if (!orgId) {
              throw new APIError("BAD_REQUEST", {
                message: "No organization specified.",
              });
            }

            // Find the org owner to check their subscription
            const orgOwner = await ctx.context.adapter.findOne<{
              userId: string;
            }>({
              model: "member",
              where: [
                { field: "organizationId", value: orgId },
                { field: "role", value: "owner" },
              ],
            });

            if (!orgOwner) {
              throw new APIError("BAD_REQUEST", {
                message: "Organization owner not found.",
              });
            }

            // Look up the owner's email
            const ownerUser = await ctx.context.adapter.findOne<{
              email: string;
            }>({
              model: "user",
              where: [{ field: "id", value: orgOwner.userId }],
            });

            if (!ownerUser) {
              throw new APIError("BAD_REQUEST", {
                message: "Organization owner user not found.",
              });
            }

            const tier = await getSubscriptionTier(ownerUser.email);
            const limit = LIMITS[tier].maxMembers;

            if (limit !== null) {
              // Count existing members in the org
              const currentMembers = await ctx.context.adapter.findMany({
                model: "member",
                where: [{ field: "organizationId", value: orgId }],
              });

              if (currentMembers.length >= limit) {
                const planName = tier.charAt(0).toUpperCase() + tier.slice(1);
                throw new APIError("FORBIDDEN", {
                  message: `${planName} plan allows a maximum of ${limit} members per organization. Please upgrade to add more.`,
                });
              }
            }

            return { context: ctx };
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};

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
      subscriptionLimitsPlugin(),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: env.POLAR_FREE_PRODUCT_ID,
                slug: "free",
              },
              {
                productId: env.POLAR_PREMIUM_PRODUCT_ID,
                slug: "premium",
              },
              {
                productId: env.POLAR_FAMILY_PRODUCT_ID,
                slug: "family",
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
