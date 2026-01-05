"use client";

import LobbyState from "./lobby-state";
import { useRoom } from "./room-provider";

export default function Room() {
  const { roomState } = useRoom();

  if (roomState === "lobby") return <LobbyState />;

  return null;
}
