"use client";

import LobbyState from "@/components/room/lobby-state";
import { io, Socket } from "@/lib/socket";
import { createContext, use, useEffect, useState } from "react";

type RoomState = "lobby" | "joined" | "lost";

interface RoomContextValue {
  roomId: string;
  socket: Socket;
  roomState: RoomState;
  setRoomState: React.Dispatch<React.SetStateAction<RoomState>>;
}

const RoomContext = createContext<RoomContextValue>({
  roomId: "",
  roomState: "lobby",
  socket: {} as Socket,
  setRoomState: () => void 0,
});

const getSocket = () => {
  return io(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? ""}/room`, {
    autoConnect: false,
  });
};

export function Room({ roomId }: { roomId: string }) {
  const [socket] = useState(getSocket);
  const [roomState, setRoomState] = useState<RoomState>("lobby");

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <RoomContext value={{ roomId, socket, roomState, setRoomState }}>
      {roomState === "lobby" && <LobbyState />}
    </RoomContext>
  );
}

export const useRoom = () => use(RoomContext);
