import "client-only";

import { io as baseIo, Socket as BaseSocket } from "socket.io-client";

export interface Socket extends BaseSocket {
  request<T>(event: string, data?: Record<string, unknown>): Promise<T>;
}

export function io(...args: Parameters<typeof baseIo>) {
  const socket = baseIo(...args) as Socket;

  socket.request = async <T>(event: string, data = {}) => {
    return socket.emitWithAck(event, { ...data }) as Promise<T>;
  };

  return socket;
}
