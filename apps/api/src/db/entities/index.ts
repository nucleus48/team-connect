import { int, text } from "drizzle-orm/sqlite-core";

export const uuid = (name?: string) =>
  text(name).$defaultFn(() => crypto.randomUUID());

export const defaultSchema = {
  createdAt: int("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: int("updated_at").$onUpdateFn(() => Date.now()),
};
