import "client-only";

import { io as baseIo, Socket as BaseSocket } from "socket.io-client";
import { fetchAccessToken } from "./actions";

export interface Socket extends BaseSocket {
  request<T>(event: string, data?: Record<string, unknown>): Promise<T>;
}

export function io(...args: Parameters<typeof baseIo>) {
  const socket = baseIo(...args) as Socket;

  let accessToken: string | undefined;

  socket.request = async (event, data = {}) => {
    if (!accessToken) {
      accessToken = await fetchAccessToken();

      setTimeout(() => {
        accessToken = undefined;
      }, 40000);
    }

    return socket.emitWithAck(event, { ...data, accessToken });
  };

  return socket;
}
