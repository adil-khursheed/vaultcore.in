import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export * from "./auth-schema";

export const vaultKey = pgTable(
  "vaultKey",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    iv: text("iv").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("vaultKey_userId_idx").on(table.userId)],
);
