import { roomsTable, roomUserRolesTable } from "./rooms";
import { usersTable } from "./users";

export const schema = {
  users: usersTable,
  rooms: roomsTable,
  roomUserRoles: roomUserRolesTable,
};
