import { CurrentUser } from "@repo/shared-types";
import "express-serve-static-core";
import { Socket as BaseSocket } from "socket.io";

declare module "express-serve-static-core" {
  interface Request {
    user: CurrentUser;
  }
}

declare module "socket.io" {
  interface Socket extends BaseSocket {
    user: CurrentUser;
    roomId: string;
  }
}
