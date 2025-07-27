import { RoomRole } from "@/rooms/rooms.role";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { defaultSchema, uuid } from ".";
import { usersTable } from "./users";

export const roomsTable = sqliteTable("room", {
  id: uuid().primaryKey(),
  ...defaultSchema,
});

export const roomUserRolesTable = sqliteTable("room_user_role", {
  id: uuid().primaryKey(),
  role: text().$type<RoomRole>().notNull(),
  userId: text("user_id")
    .references(() => usersTable.id)
    .notNull(),
  roomId: text("room_id")
    .references(() => roomsTable.id)
    .notNull(),
  ...defaultSchema,
});

export type Room = typeof roomsTable.$inferSelect;
export type RoomUserRole = typeof roomUserRolesTable.$inferSelect;
