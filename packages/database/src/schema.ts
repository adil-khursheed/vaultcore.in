import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import * as authSchema from "./auth-schema.ts";

export const {
  organization,
  user,
  member,
  invitation,
  verification,
  session,
  account,
} = authSchema;
export * from "./auth-schema.ts";

/**
 * @deprecated Legacy vault key table using AES-GCM wrapping with master key.
 * Replaced by `memberVaultKey` which uses RSA-OAEP per-member wrapping.
 * Kept only for migration of existing data.
 */
export const vaultKey = pgTable(
  "vaultKey",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    iv: text("iv").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("vaultKey_organizationId_idx").on(table.organizationId)],
);

export const memberVaultKey = pgTable(
  "member_vault_key",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    encryptedKey: text("encrypted_key").notNull(), // vault key wrapped with user's RSA public key
    status: text("status", { enum: ["active", "pending"] })
      .notNull()
      .default("pending"),
    keyVersion: integer("key_version").notNull().default(1),
    rotatedAt: timestamp("rotated_at"),
    grantedBy: text("granted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("member_vault_key_org_user_uidx").on(
      table.organizationId,
      table.userId,
    ),
    index("member_vault_key_userId_idx").on(table.userId),
  ],
);

export const credentialTypeEnum = pgEnum("credential_type", [
  "login",
  "card",
  "identity",
  "note",
  "ssh_key",
]);

export const credential = pgTable(
  "credential",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    username: text("username"),
    password: text("password"),
    url: text("url"),
    note: text("note"),
    type: credentialTypeEnum("type").default("login").notNull(),
    data: jsonb("data"),
    otp: text("otp"),
    isFavorite: boolean("is_favorite").default(false),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("credential_organizationId_idx").on(table.organizationId)],
);

export const plans = pgTable(
  "plans",
  {
    id: text("id").primaryKey(),
    polarProductId: text("polar_product_id"),
    name: text("name").notNull(),
    description: text("description"),
    yearlyPriceUsd: integer("yearly_price_usd"), // in cents; 0 for free
    maxOrgsPerUser: integer("max_orgs_per_user"), // null = unlimited
    maxMembersPerOrg: integer("max_members_per_org"), // null = unlimited
    features: jsonb("features").$type<string[]>().default([]),
    isActive: boolean("is_active").notNull().default(true),
    isPopular: boolean("is_popular").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("plans_polar_product_id_uidx").on(table.polarProductId),
  ],
);

export const organizationSubscriptions = pgTable(
  "organization_subscriptions",
  {
    id: text("id").primaryKey(), // Polar subscription ID; use org ID for free rows
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    // The user who initiated/owns the subscription (billing owner)
    billingUserId: text("billing_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    polarCustomerId: text("polar_customer_id"),
    polarProductId: text("polar_product_id"),
    status: text("status", {
      enum: [
        "active",
        "canceled",
        "past_due",
        "unpaid",
        "incomplete",
        "trialing",
        "paused",
        "free",
      ],
    })
      .notNull()
      .default("free"),
    interval: text("interval", { enum: ["month", "year"] }),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    canceledAt: timestamp("canceled_at"),
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("org_subscriptions_org_id_idx").on(table.organizationId),
    index("org_subscriptions_status_idx").on(table.status),
    uniqueIndex("org_subscriptions_org_id_unique").on(table.organizationId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(), // Polar order/invoice ID
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    billingUserId: text("billing_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    subscriptionId: text("subscription_id").references(
      () => organizationSubscriptions.id,
      { onDelete: "set null" },
    ),
    polarOrderId: text("polar_order_id").unique(),
    polarCustomerId: text("polar_customer_id"),
    amount: integer("amount").notNull(), // in cents
    currency: text("currency").notNull().default("usd"),
    status: text("status", {
      enum: ["paid", "refunded", "partially_refunded", "failed", "pending"],
    }).notNull(),
    description: text("description"),
    invoiceUrl: text("invoice_url"),
    receiptUrl: text("receipt_url"),
    refundedAmount: integer("refunded_amount").default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payments_org_id_idx").on(table.organizationId),
    index("payments_subscription_id_idx").on(table.subscriptionId),
  ],
);

// --- Vault Key Rotation Log ---

export const vaultKeyRotationLog = pgTable(
  "vault_key_rotation_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    initiatedBy: text("initiated_by")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    previousVersion: integer("previous_version").notNull(),
    newVersion: integer("new_version").notNull(),
    membersRotated: integer("members_rotated").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("vault_key_rotation_org_idx").on(table.organizationId),
  ],
);

// --- Audit Log ---

export const auditActionEnum = pgEnum("audit_action", [
  "vault_key_granted",
  "vault_key_revoked",
  "vault_key_rotated",
  "member_invited",
  "member_accepted",
  "member_removed",
  "credential_created",
  "credential_updated",
  "credential_deleted",
  "vault_unlocked",
  "vault_locked",
  "user_keys_migrated",
  "login_success",
  "login_failed",
]);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    targetUserId: text("target_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_org_id_idx").on(table.organizationId),
    index("audit_log_actor_idx").on(table.actorUserId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

// --- Relations ---

export const memberVaultKeyRelations = relations(
  memberVaultKey,
  ({ one }) => ({
    organization: one(organization, {
      fields: [memberVaultKey.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [memberVaultKey.userId],
      references: [user.id],
      relationName: "memberVaultKeyUser",
    }),
    grantor: one(user, {
      fields: [memberVaultKey.grantedBy],
      references: [user.id],
      relationName: "memberVaultKeyGrantor",
    }),
  }),
);

export const credentialRelations = relations(credential, ({ one }) => ({
  organization: one(organization, {
    fields: [credential.organizationId],
    references: [organization.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(organizationSubscriptions),
}));

export const organizationSubscriptionsRelations = relations(
  organizationSubscriptions,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationSubscriptions.organizationId],
      references: [organization.id],
    }),
    plan: one(plans, {
      fields: [organizationSubscriptions.planId],
      references: [plans.id],
    }),
    billingUser: one(user, {
      fields: [organizationSubscriptions.billingUserId],
      references: [user.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organization, {
    fields: [payments.organizationId],
    references: [organization.id],
  }),
  billingUser: one(user, {
    fields: [payments.billingUserId],
    references: [user.id],
  }),
  subscription: one(organizationSubscriptions, {
    fields: [payments.subscriptionId],
    references: [organizationSubscriptions.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organization, {
    fields: [auditLog.organizationId],
    references: [organization.id],
  }),
  actor: one(user, {
    fields: [auditLog.actorUserId],
    references: [user.id],
    relationName: "auditLogActor",
  }),
  target: one(user, {
    fields: [auditLog.targetUserId],
    references: [user.id],
    relationName: "auditLogTarget",
  }),
}));

export const vaultKeyRotationLogRelations = relations(
  vaultKeyRotationLog,
  ({ one }) => ({
    organization: one(organization, {
      fields: [vaultKeyRotationLog.organizationId],
      references: [organization.id],
    }),
    initiator: one(user, {
      fields: [vaultKeyRotationLog.initiatedBy],
      references: [user.id],
    }),
  }),
);
