import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { TokenPayload } from "@repo/shared-types";
import { Request } from "express";
import { Socket } from "socket.io";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() === "http") {
      return this.authorizeHttpRequest(context);
    } else if (context.getType() === "ws") {
      return this.authorizeWsEvent(context);
    }

    return false;
  }

  async authorizeHttpRequest(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const [type, accessToken] =
        request.headers.authorization?.split(" ") ?? [];

      if (type === "Bearer" && typeof accessToken === "string") {
        const payload: TokenPayload =
          await this.jwtService.verifyAsync(accessToken);

        request.user = {
          userId: payload.sub,
          email: payload.email,
          roles: [],
        };

        return true;
      }

      throw new Error();
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  async authorizeWsEvent(context: ExecutionContext) {
    try {
      const ws = context.switchToWs();
      const { accessToken } = ws.getData<{ accessToken: string }>() ?? {};

      if (typeof accessToken === "string") {
        const payload: TokenPayload =
          await this.jwtService.verifyAsync(accessToken);

        const client = ws.getClient<Socket>();

        client.user = {
          userId: payload.sub,
          email: payload.email,
          roles: [],
        };

        return true;
      }

      throw new Error();
    } catch {
      throw new WsException("Invalid access token");
    }
  }
}
