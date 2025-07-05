import { Socket } from "socket.io";

export interface MediaSocket extends Socket {
  routerId: string;
}

export interface MediaStream {
  routerId: string;
  streamId: string;
  producers: string[];
}
