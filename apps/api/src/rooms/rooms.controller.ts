import { AuthUser } from "@/auth/auth.decorator";
import { AuthGuard } from "@/auth/auth.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@repo/shared-types";
import { RoomRoles } from "./rooms.decorator";
import { AddUserRoleDto } from "./rooms.dto";
import { RoomRolesGuard } from "./rooms.guard";
import { RoomRole } from "./rooms.role";
import { RoomsService } from "./rooms.service";

@UseGuards(AuthGuard)
@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post("create")
  handleCreateRoom(@AuthUser() user: CurrentUser) {
    return this.roomsService.createRoom({ id: user.userId });
  }

  @UseGuards(RoomRolesGuard)
  @RoomRoles(RoomRole.Admin)
  @Post("addUserRole")
  handleAddUserRole(@Body() data: AddUserRoleDto) {
    return this.roomsService.addUserRole(data);
  }
}
