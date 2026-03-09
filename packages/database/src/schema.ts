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

import * as authSchema from "./auth-schema";

export const { organization, user, member, verification, session, account } =
  authSchema;
export * from "./auth-schema";

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

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  polarProductId: text("polar_product_id"),
  name: text("name").notNull(),
  description: text("description"),
  yearlyPriceUsd: integer("yearly_price_usd"), // in cents; 0 for free
  maxOrgsPerUser: integer("max_orgs_per_user"), // null = unlimited
  maxMembersPerOrg: integer("max_members_per_org"), // null = unlimited
  features: jsonb("features").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

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
