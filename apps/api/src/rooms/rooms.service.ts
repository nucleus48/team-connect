import { Database, DATABASE } from "@/db/db.module";
import {
  roomsTable,
  RoomUserRole,
  roomUserRolesTable,
} from "@/db/entities/rooms";
import { User } from "@/db/entities/users";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { RoomRole } from "./rooms.role";

@Injectable()
export class RoomsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  createRoom({ id: userId }: Pick<User, "id">) {
    return this.db.transaction(async (tx) => {
      const [{ roomId }] = await tx
        .insert(roomsTable)
        .values({})
        .returning({ roomId: roomsTable.id });

      await tx.insert(roomUserRolesTable).values([
        { role: RoomRole.Admin, userId, roomId },
        { role: RoomRole.Member, userId, roomId },
      ]);

      return roomId;
    });
  }

  async getUserRoles({
    userId,
    roomId,
  }: Pick<RoomUserRole, "userId" | "roomId">) {
    const userRoles = await this.db.query.roomUserRoles.findMany({
      columns: { role: true },
      where: () =>
        and(
          eq(roomUserRolesTable.userId, userId),
          eq(roomUserRolesTable.roomId, roomId),
        ),
    });

    return userRoles.map((userRole) => userRole.role);
  }

  async getAdminUsers({ roomId }: Pick<RoomUserRole, "roomId">) {
    const adminUsers = await this.db.query.roomUserRoles.findMany({
      columns: { userId: true },
      where: () =>
        and(
          eq(roomUserRolesTable.role, RoomRole.Admin),
          eq(roomUserRolesTable.roomId, roomId),
        ),
    });

    return adminUsers.map((adminUser) => adminUser.userId);
  }

  async addUserRole({
    role,
    roomId,
    userId,
  }: Pick<RoomUserRole, "roomId" | "userId" | "role">) {
    await this.db.insert(roomUserRolesTable).values({ role, roomId, userId });
  }

  // deleteRoom({ id: roomId }: Pick<Room, "id">) {
  //   return this.db.delete(roomsTable).where(eq(roomsTable.id, roomId));
  // }

  // async getUsers({ id: roomId }: Pick<Room, "id">) {
  //   const users = await this.db.query.roomUserRoles.findMany({
  //     columns: { userId: true, role: true },
  //     where: () => eq(roomUserRolesTable.roomId, roomId),
  //   });

  //   return users;
  // }

  // updateUser({
  //   role,
  //   roomId,
  //   userId,
  // }: Pick<RoomUserRole, "userId" | "role" | "roomId">) {
  //   return this.db
  //     .update(roomUserRolesTable)
  //     .set({ role })
  //     .where(
  //       and(
  //         eq(roomUserRolesTable.roomId, roomId),
  //         eq(roomUserRolesTable.userId, userId),
  //       ),
  //     );
  // }

  // removeUser({ roomId, userId }: Pick<RoomUserRole, "userId" | "roomId">) {
  //   return this.db
  //     .delete(roomUserRolesTable)
  //     .where(
  //       and(
  //         eq(roomUserRolesTable.roomId, roomId),
  //         eq(roomUserRolesTable.userId, userId),
  //       ),
  //     );
  // }
}
