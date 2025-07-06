import { io as baseIo, type Socket as ISocket } from "socket.io-client";

export interface Socket extends ISocket {
  request<T>(event: string, data?: unknown): Promise<T>;
}

export function io(...args: Parameters<typeof baseIo>) {
  const socket = baseIo(...args) as Socket;

  socket.request = (event, data) => {
    return new Promise((resolve) =>
      socket.emit(event, data, (data: never) => resolve(data)),
    );
  };

  return socket;
}
