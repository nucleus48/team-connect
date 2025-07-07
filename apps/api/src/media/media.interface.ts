import { Socket } from "socket.io";

export interface IMediaSocket extends Socket {
  routerId: string;
}

export interface IMediaStream {
  id: string;
  routerId: string;
  clientId: string;
  transportId: string;
  producers: string[];
}
