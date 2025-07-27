import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { Socket } from "socket.io";

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === "ws") {
      const client = context.switchToWs().getClient<Socket>();
      return client.user;
    } else {
      const request = context.switchToHttp().getRequest<Request>();
      return request.user;
    }
  },
);
