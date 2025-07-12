import { io as baseIo, type Socket as ISocket } from "socket.io-client";

export interface Socket extends ISocket {
  request<T>(event: string, data?: unknown): Promise<T>;
}

export function io(...args: Parameters<typeof baseIo>) {
  const socket = baseIo(...args) as Socket;

  socket.request = <T>(event: string, data: unknown) => {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for event: ${event}`));
      }, 10000); // 10 second timeout

      socket.emit(event, data, (response: T & { error?: string }) => {
        clearTimeout(timeout);
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  return socket;
}
