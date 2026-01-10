import { Controller, Param, Post } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { RoomService } from "./room.service";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post("create")
  async createRoom(@Session() session: UserSession) {
    const result = await this.roomService.create(session.user.id);
    return result;
  }

  @Post("join/:roomId")
  async joinRoom(
    @Param("roomId") roomId: string,
    @Session() session: UserSession,
  ) {
    const result = await this.roomService.join(roomId, session.user.id);
    return result;
  }
}
