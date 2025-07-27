import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { defaultSchema, uuid } from ".";

export const usersTable = sqliteTable("user", {
  id: uuid().primaryKey(),
  email: text().notNull().unique(),
  password: text().notNull(),
  ...defaultSchema,
});

export type User = typeof usersTable.$inferSelect;
