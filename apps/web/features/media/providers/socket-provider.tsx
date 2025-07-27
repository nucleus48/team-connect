"use client";

import { io, Socket } from "@/lib/socket";
import { createContext, use, useEffect, useMemo } from "react";

export type SocketProviderProps = React.PropsWithChildren<{
  roomId: string;
}>;

const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({
  roomId,
  children,
}: SocketProviderProps) {
  const socket = useMemo(() => {
    return io(`http://localhost:3030/?roomId=${roomId}`, {
      autoConnect: false,
    });
  }, [roomId]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext value={socket}>{children}</SocketContext>;
}

export const useSocket = () => use(SocketContext)!;
