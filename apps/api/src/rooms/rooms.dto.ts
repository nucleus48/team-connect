import { IsString } from "class-validator";
import { RoomRole } from "./rooms.role";

export class AddUserRoleDto {
  @IsString()
  userId: string;

  @IsString()
  roomId: string;

  @IsString()
  role: RoomRole;
}
