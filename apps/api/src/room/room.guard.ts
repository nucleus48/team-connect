import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { RoomService } from "./room.service";

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(private roomService: RoomService) {}

  async canActivate(context: ExecutionContext) {
    const ws = context.switchToWs();
    const client = ws.getClient<Socket>();
    const roomId = client.handshake.query.roomId;

    if (!client.user || typeof roomId !== "string") {
      return false;
    }

    const participant = await this.roomService.getRoomParticipant(
      roomId,
      client.user.id,
    );

    if (!participant) {
      return false;
    }

    client.roomId = roomId;
    client.participant = participant;

    return true;
  }
}
