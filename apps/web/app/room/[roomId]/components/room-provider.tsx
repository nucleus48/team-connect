"use client";

import { createContext, use, useState } from "react";

type RoomState = "lobby" | "joined" | "lost";

interface RoomContextValue {
  roomId: string;
  roomState: RoomState;
  setRoomState: React.Dispatch<React.SetStateAction<RoomState>>;
}

const RoomContext = createContext<RoomContextValue>({
  roomId: "",
  roomState: "lobby",
  setRoomState: () => void 0,
});

export default function RoomProvider({
  roomId,
  children,
}: React.PropsWithChildren<{ roomId: string }>) {
  const [roomState, setRoomState] = useState<RoomState>("lobby");

  return (
    <RoomContext value={{ roomId, roomState, setRoomState }}>
      {children}
    </RoomContext>
  );
}

export const useRoom = () => use(RoomContext);
