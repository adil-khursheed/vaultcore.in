import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import {
  checkout,
  polar,
  portal,
  webhooks,
} from "@polar-sh/better-auth";
import { createPolar, createPolarCore } from "@polar-sh/sdk/2026-10";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import {
  bearer,
  organization as organizationPlugin,
} from "better-auth/plugins";

import { and, eq, gt } from "@repo/db";
import { db } from "@repo/db/client";
import {
  auditLog,
  invitation,
  member,
  memberVaultKey,
  organizationSecurity,
  organizationSubscriptions,
  payments,
  plans,
  user,
  verification,
} from "@repo/db/schema";
import { queueJob } from "@repo/jobs";

import { env } from "../env.ts";
import {
  canCreateOrg,
  canInviteMember,
  getOrgPlan,
} from "./utils/entitlements.ts";

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

const polarOptions = {
  accessToken: env.POLAR_ACCESS_TOKEN,
  environment: (env.NODE_ENV === "production"
    ? "production"
    : "sandbox") as "production" | "sandbox",
};
const polarCore = createPolarCore(polarOptions);
const polarClient = createPolar(polarOptions);

/**
 * Remember that a member left, so admins are prompted to rotate the vault
 * key. Rotation itself must run in an unlocked browser (zero-knowledge).
 */
async function markKeyRotationRequired(
  organizationId: string,
  requestedBy: string | null,
) {
  const now = new Date();

  await db
    .insert(organizationSecurity)
    .values({ organizationId, keyRotationRequiredAt: now, requestedBy })
    .onConflictDoUpdate({
      target: organizationSecurity.organizationId,
      set: { keyRotationRequiredAt: now, requestedBy },
    });
}

/**
 * Cancel the organization's Polar subscription before the org row (and its
 * subscription row) is deleted. Throws so the deletion is blocked when Polar
 * cannot be reached — a deleted org must never keep billing.
 */
async function cancelPolarSubscription(organizationId: string) {
  const subscription = await db.query.organizationSubscriptions.findFirst({
    where: eq(organizationSubscriptions.organizationId, organizationId),
  });

  const subscriptionIds: string[] = [];

  if (subscription) {
    if (
      !subscription.id.startsWith("free_") &&
      subscription.status !== "canceled"
    ) {
      subscriptionIds.push(subscription.id);
    }
  } else {
    // Webhook lag: the subscription can exist in Polar without a local row.
    for await (const item of polarClient.subscriptions.iterList({
      metadata: { referenceId: organizationId },
      active: true,
      limit: 100,
    })) {
      if (item.status !== "canceled") subscriptionIds.push(item.id);
    }
  }

  for (const id of subscriptionIds) {
    try {
      await polarClient.subscriptions.revoke(id);
    } catch (error) {
      const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
          ? (error as { statusCode?: number }).statusCode
          : undefined;

      // Already gone on Polar's side is fine.
      if (statusCode === 404) continue;

      console.error("[AUTH] Failed to cancel Polar subscription", error);
      throw new APIError("INTERNAL_SERVER_ERROR", {
        message:
          "We couldn't cancel the billing subscription, so the organization was not deleted. Please try again.",
      });
    }
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

            const { organizationId, resend, email } = ctx.body as {
              organizationId?: string;
              resend?: boolean;
              email?: string;
            };

            const orgId =
              organizationId ?? session.session.activeOrganizationId;

            if (!orgId) {
              throw new APIError("BAD_REQUEST", {
                message: "No organization specified.",
              });
            }

            // Resending an existing invitation does not consume a new seat.
            if (resend && email) {
              const existingInvitation = await db.query.invitation.findFirst({
                where: and(
                  eq(invitation.organizationId, orgId),
                  eq(invitation.email, email.toLowerCase()),
                  eq(invitation.status, "pending"),
                  gt(invitation.expiresAt, new Date()),
                ),
              });

              if (existingInvitation) {
                return { context: ctx };
              }
            }

            const canInvite = await canInviteMember(orgId);

            if (!canInvite) {
              throw new APIError("FORBIDDEN", {
                message: `This organization has reached the maximum number of members for its plan. Please upgrade to invite more people.`,
              });
            }

            return { context: ctx };
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};

/**
 * Better Auth has no leave hook, so clean up after /organization/leave here.
 * Without this the leaver keeps a wrapped key row and no admin is prompted to
 * rotate the key.
 */
const memberLifecyclePlugin = () => {
  return {
    id: "member-lifecycle",
    hooks: {
      after: [
        {
          matcher: (ctx) => ctx.path === "/organization/leave",
          handler: createAuthMiddleware(async (ctx) => {
            const userId = ctx.context.session?.user.id;
            const organizationId = (
              ctx.body as { organizationId?: string } | undefined
            )?.organizationId;

            if (!userId || !organizationId) return;

            // After hooks also run when the endpoint failed (e.g. the only
            // owner cannot leave). Only clean up if the member is gone.
            const stillMember = await db.query.member.findFirst({
              where: and(
                eq(member.organizationId, organizationId),
                eq(member.userId, userId),
              ),
            });

            if (stillMember) return;

            await db
              .delete(memberVaultKey)
              .where(
                and(
                  eq(memberVaultKey.organizationId, organizationId),
                  eq(memberVaultKey.userId, userId),
                ),
              );

            await db
              .insert(auditLog)
              .values({
                targetUserId: userId,
                organizationId,
                action: "member_removed",
                metadata: { reason: "left" },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log member_removed audit event",
                  error,
                );
              });

            await markKeyRotationRequired(organizationId, userId).catch(
              (error: unknown) => {
                console.error(
                  "[AUTH] Failed to mark key rotation as required",
                  error,
                );
              },
            );
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
        membershipLimit: async (_user, organization) => {
          const plan = await getOrgPlan(organization.id);
          return plan.maxMembersPerOrg ?? 1_000_000;
        },
        sendInvitationEmail: async ({
          id,
          email,
          role,
          organization,
          inviter,
          invitation,
        }) => {
          try {
            await queueJob("SEND_EMAIL", {
              to: email,
              subject: `You're invited to join ${organization.name} on VaultCore`,
              props: {
                type: "invitation",
                organizationName: organization.name,
                inviterName: inviter.user.name,
                role,
                expiresAt: invitation.expiresAt.toISOString(),
                actionUrl: `${options.baseUrl}/accept-invitation/${id}`,
              },
            });
          } catch (error) {
            console.error("[AUTH] Failed to queue invitation email", error);
          }
        },
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
          afterAddMember: async ({ member, organization }) => {
            // The owner is added here when an organization is created. Insert a
            // pending key row so the admin grant flow has a single consistent
            // starting point; self-grant immediately promotes it to active.
            await db
              .insert(memberVaultKey)
              .values({
                organizationId: organization.id,
                userId: member.userId,
                encryptedKey: "PENDING",
                status: "pending",
              })
              .onConflictDoNothing();
          },
          afterRemoveMember: async ({ member, organization }) => {
            // Revoke the member's wrapped vault key immediately. Without this,
            // a removed user could still decrypt anything they had cached.
            await db
              .delete(memberVaultKey)
              .where(
                and(
                  eq(memberVaultKey.organizationId, organization.id),
                  eq(memberVaultKey.userId, member.userId),
                ),
              );

            await db
              .insert(auditLog)
              .values({
                targetUserId: member.userId,
                organizationId: organization.id,
                action: "member_removed",
                metadata: { role: member.role },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log member_removed audit event",
                  error,
                );
              });

            await markKeyRotationRequired(organization.id, null).catch(
              (error: unknown) => {
                console.error(
                  "[AUTH] Failed to mark key rotation as required",
                  error,
                );
              },
            );
          },
          afterUpdateMemberRole: async ({
            member,
            previousRole,
            organization,
          }) => {
            await db
              .insert(auditLog)
              .values({
                targetUserId: member.userId,
                organizationId: organization.id,
                action: "member_role_updated",
                metadata: { previousRole, newRole: member.role },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log member_role_updated audit event",
                  error,
                );
              });
          },
          beforeDeleteOrganization: async ({ organization, user }) => {
            // Stop billing first. Throwing here blocks the deletion.
            await cancelPolarSubscription(organization.id);

            // Log before the row disappears; the audit row keeps a null
            // organizationId afterwards via the FK's onDelete: set null.
            await db
              .insert(auditLog)
              .values({
                actorUserId: user.id,
                organizationId: organization.id,
                action: "organization_deleted",
                metadata: {
                  name: organization.name,
                  slug: organization.slug,
                },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log organization_deleted audit event",
                  error,
                );
              });
          },
          afterCreateInvitation: async ({
            invitation,
            inviter,
            organization,
          }) => {
            await db
              .insert(auditLog)
              .values({
                actorUserId: inviter.id,
                organizationId: organization.id,
                action: "member_invited",
                metadata: {
                  email: invitation.email,
                  role: invitation.role,
                  invitationId: invitation.id,
                },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log member_invited audit event",
                  error,
                );
              });
          },
          afterAcceptInvitation: async ({
            invitation,
            member,
            user,
            organization,
          }) => {
            await db
              .insert(memberVaultKey)
              .values({
                organizationId: organization.id,
                userId: user.id,
                encryptedKey: "PENDING",
                status: "pending",
              })
              .onConflictDoNothing();

            await db
              .insert(auditLog)
              .values({
                actorUserId: user.id,
                organizationId: organization.id,
                action: "member_accepted",
                metadata: {
                  role: member.role,
                  invitationId: invitation.id,
                },
              })
              .catch((error: unknown) => {
                console.error(
                  "[AUTH] Failed to log member_accepted audit event",
                  error,
                );
              });
          },
        },
      }),
      vaultVerificationPlugin(),
      subscriptionLimitsPlugin(),
      memberLifecyclePlugin(),
      // Allows clients (the browser extension) to authenticate with a bearer
      // token instead of relying on third-party cookies.
      bearer(),
      polar({
        client: polarCore,
        createCustomerOnSignUp: false,
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
          webhooks({
            secret: env.POLAR_WEBHOOK_SECRET,
            async onSubscriptionCreated(subscription) {
              try {
                const orgId =
                  (subscription.data.metadata?.referenceId as string) ||
                  (subscription.data.metadata?.organizationId as string);
                if (!orgId) return;

                const plan = await db.query.plans.findFirst({
                  where: eq(plans.polarProductId, subscription.data.product_id),
                });

                if (plan) {
                  await db
                    .insert(organizationSubscriptions)
                    .values({
                      id: subscription.data.id,
                      organizationId: orgId,
                      planId: plan.id,
                      polarCustomerId: subscription.data.customer_id,
                      polarProductId: subscription.data.product_id,
                      status: subscription.data.status as any,
                      interval: subscription.data.recurring_interval as any,
                      currentPeriodStart: new Date(
                        subscription.data.current_period_start,
                      ),
                      currentPeriodEnd: subscription.data.current_period_end
                        ? new Date(subscription.data.current_period_end)
                        : null,
                      cancelAtPeriodEnd: subscription.data.cancel_at_period_end,
                      metadata: subscription.data.metadata as any,
                    })
                    .onConflictDoUpdate({
                      target: organizationSubscriptions.organizationId,
                      set: {
                        id: subscription.data.id,
                        planId: plan.id,
                        polarCustomerId: subscription.data.customer_id,
                        polarProductId: subscription.data.product_id,
                        status: subscription.data.status as any,
                        interval: subscription.data.recurring_interval as any,
                        currentPeriodStart: new Date(
                          subscription.data.current_period_start,
                        ),
                        currentPeriodEnd: subscription.data.current_period_end
                          ? new Date(subscription.data.current_period_end)
                          : null,
                        cancelAtPeriodEnd:
                          subscription.data.cancel_at_period_end,
                        metadata: subscription.data.metadata,
                      },
                    });
                }
              } catch (error) {
                console.log(error);
              }
            },
            async onSubscriptionUpdated(subscription) {
              const plan = await db.query.plans.findFirst({
                where: eq(plans.polarProductId, subscription.data.product_id),
              });

              await db
                .update(organizationSubscriptions)
                .set({
                  status: subscription.data.status as any,
                  planId: plan?.id,
                  currentPeriodEnd: subscription.data.current_period_end
                    ? new Date(subscription.data.current_period_end)
                    : null,
                  cancelAtPeriodEnd: subscription.data.cancel_at_period_end,
                  canceledAt: subscription.data.canceled_at
                    ? new Date(subscription.data.canceled_at)
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
                  canceledAt: subscription.data.canceled_at
                    ? new Date(subscription.data.canceled_at)
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
                  subscriptionId: order.data.subscription_id,
                  polarOrderId: order.data.id,
                  polarCustomerId: order.data.customer_id,
                  amount: order.data.total_amount,
                  currency: order.data.currency,
                  status: "paid",
                  description: `Payment for ${order.data.product?.name}`,
                  metadata: order.data.metadata as any,
                  paidAt: new Date(order.data.created_at),
                })
                .onConflictDoNothing();
            },
            async onOrderRefunded(order) {
              await db
                .update(payments)
                .set({
                  status: "refunded",
                  refundedAmount: order.data.total_amount,
                })
                .where(eq(payments.id, order.data.id));
            },
          }),
        ],
      }),
      ...(options.extraPlugins ?? []),
    ],
    trustedOrigins: ["exp://", "chrome-extension://"],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        publicKey: {
          type: "string",
          required: false, // Make it optional for migration, but required for new signups
        },
        encryptedPrivateKey: {
          type: "string",
          required: false,
        },
        privateKeyIv: {
          type: "string",
          required: false,
        },
        publicKeyFingerprint: {
          type: "string",
          required: false,
        },
      },
    },
    onAPIError: {
      onError(error) {
        const err = error as {
          name?: string;
          message?: string;
          status?: string;
        };
        console.error("BETTER AUTH API ERROR", {
          name: err.name,
          message: err.message,
          status: err.status,
        });
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
