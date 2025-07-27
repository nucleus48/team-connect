import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { RoomRoles } from "./rooms.decorator";
import { RoomRole } from "./rooms.role";
import { RoomsService } from "./rooms.service";

@Injectable()
export class RoomRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roomsService: RoomsService,
  ) {}

  canActivate(context: ExecutionContext) {
    let roles = this.reflector.get<RoomRole[]>(
      RoomRoles.name,
      context.getHandler(),
    );

    if (!roles) {
      roles = this.reflector.get<RoomRole[]>(
        RoomRoles.name,
        context.getClass(),
      );
    }

    if (context.getType() === "ws") {
      return this.authorizeWsEvent(context, roles);
    }

    return false;
  }

  async authorizeWsEvent(context: ExecutionContext, roles: RoomRole[]) {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const userRoles = await this.roomsService.getUserRoles({
        roomId: client.roomId,
        userId: client.user.userId,
      });

      client.user.roles = userRoles;

      return roles.some((role) => userRoles.includes(role));
    } catch {
      throw new WsException("Unauthorized");
    }
  }
}
