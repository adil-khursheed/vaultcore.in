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
import { db } from "@repo/db/client";
import {
  organizationSubscriptions,
  payments,
  plans,
  user,
  verification,
} from "@repo/db/schema";

import { env } from "../env.ts";
import { canAddMember, canCreateOrg } from "./utils/entitlements.ts";

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

            const canCreate = await canCreateOrg(session.user.id);

            if (!canCreate) {
              throw new APIError("FORBIDDEN", {
                message: `You have reached the maximum number of organizations for your plan. Please upgrade to create more.`,
              });
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

            const orgId =
              organizationId ?? session.session.activeOrganizationId;

            if (!orgId) {
              throw new APIError("BAD_REQUEST", {
                message: "No organization specified.",
              });
            }

            const canAdd = await canAddMember(orgId);

            if (!canAdd) {
              throw new APIError("FORBIDDEN", {
                message: `This organization has reached the maximum number of members for its plan. Please upgrade to add more.`,
              });
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
      organizationPlugin({
        organizationHooks: {
          afterCreateOrganization: async ({ organization, member, user }) => {
            await db
              .insert(organizationSubscriptions)
              .values({
                id: `free_${organization.id}`,
                organizationId: organization.id,
                planId: "free",
                status: "free",
                billingUserId: user.id,
              })
              .onConflictDoNothing();
          },
        },
      }),
      vaultVerificationPlugin(),
      subscriptionLimitsPlugin(),
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
              {
                productId: "67d26c7d-b383-4fd4-80de-3ec68b8553aa",
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
            async onSubscriptionCreated(subscription) {
              const orgId =
                (subscription.data.metadata?.referenceId as string) ||
                (subscription.data.metadata?.organizationId as string);
              if (!orgId) return;

              const plan = await db.query.plans.findFirst({
                where: eq(plans.polarProductId, subscription.data.productId),
              });

              if (plan) {
                await db
                  .insert(organizationSubscriptions)
                  .values({
                    id: subscription.data.id,
                    organizationId: orgId,
                    planId: plan.id,
                    polarCustomerId: subscription.data.customerId,
                    polarProductId: subscription.data.productId,
                    status: subscription.data.status as any,
                    interval: subscription.data.recurringInterval as any,
                    currentPeriodStart: new Date(
                      subscription.data.currentPeriodStart,
                    ),
                    currentPeriodEnd: subscription.data.currentPeriodEnd
                      ? new Date(subscription.data.currentPeriodEnd)
                      : null,
                    cancelAtPeriodEnd: subscription.data.cancelAtPeriodEnd,
                    metadata: subscription.data.metadata as any,
                  })
                  .onConflictDoUpdate({
                    target: organizationSubscriptions.id,
                    set: {
                      planId: plan.id,
                      status: subscription.data.status as any,
                      currentPeriodEnd: subscription.data.currentPeriodEnd
                        ? new Date(subscription.data.currentPeriodEnd)
                        : null,
                      cancelAtPeriodEnd: subscription.data.cancelAtPeriodEnd,
                    },
                  });
              }
            },
            async onSubscriptionUpdated(subscription) {
              const plan = await db.query.plans.findFirst({
                where: eq(plans.polarProductId, subscription.data.productId),
              });

              await db
                .update(organizationSubscriptions)
                .set({
                  status: subscription.data.status as any,
                  planId: plan?.id,
                  currentPeriodEnd: subscription.data.currentPeriodEnd
                    ? new Date(subscription.data.currentPeriodEnd)
                    : null,
                  cancelAtPeriodEnd: subscription.data.cancelAtPeriodEnd,
                  canceledAt: subscription.data.canceledAt
                    ? new Date(subscription.data.canceledAt)
                    : null,
                })
                .where(eq(organizationSubscriptions.id, subscription.data.id));
            },
            async onSubscriptionCanceled(subscription) {
              await db
                .update(organizationSubscriptions)
                .set({
                  status: "canceled",
                  cancelAtPeriodEnd: true,
                  canceledAt: subscription.data.canceledAt
                    ? new Date(subscription.data.canceledAt)
                    : null,
                })
                .where(eq(organizationSubscriptions.id, subscription.data.id));
            },
            async onSubscriptionRevoked(subscription) {
              await db
                .update(organizationSubscriptions)
                .set({
                  status: "canceled",
                })
                .where(eq(organizationSubscriptions.id, subscription.data.id));
            },
            async onOrderPaid(order) {
              const orgId =
                (order.data.metadata?.referenceId as string) ||
                (order.data.metadata?.organizationId as string);
              if (!orgId) return;

              await db
                .insert(payments)
                .values({
                  id: order.data.id,
                  organizationId: orgId,
                  billingUserId:
                    (order.data.metadata?.userId as string) || null,
                  subscriptionId: order.data.subscriptionId,
                  polarOrderId: order.data.id,
                  polarCustomerId: order.data.customerId,
                  amount: order.data.totalAmount,
                  currency: order.data.currency,
                  status: "paid",
                  description: `Payment for ${order.data.product?.name}`,
                  metadata: order.data.metadata as any,
                  paidAt: new Date(order.data.createdAt),
                })
                .onConflictDoNothing();
            },
            async onOrderRefunded(order) {
              await db
                .update(payments)
                .set({
                  status: "refunded",
                  refundedAmount: order.data.totalAmount,
                })
                .where(eq(payments.id, order.data.id));
            },
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

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
