import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const roomTable = sqliteTable("room", {
  id: text("id").primaryKey(),
  status: text("status", { enum: ["active", "closed"] })
    .default("active")
    .notNull(),
});

export const roomParticipantTable = sqliteTable("room_participant", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .references(() => roomTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["host", "participant"] })
    .default("participant")
    .notNull(),
});
