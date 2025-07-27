import { SetMetadata } from "@nestjs/common";
import { RoomRole } from "./rooms.role";

export const RoomRoles = (...roles: RoomRole[]) =>
  SetMetadata("RoomRoles", roles);
