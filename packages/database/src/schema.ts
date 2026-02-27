import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organization } from "./auth-schema";

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

export const credential = pgTable(
  "credential",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    username: text("username").notNull(),
    password: text("password").notNull(),
    url: text("url"),
    note: text("note"),
    iv: text("iv").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("credential_organizationId_idx").on(table.organizationId)],
);
