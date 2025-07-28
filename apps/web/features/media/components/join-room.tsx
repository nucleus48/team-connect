"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useTransition } from "react";
import { useSocket } from "../providers/socket-provider";

export type JoinRoomProps = {
  setJoined: (joined: boolean) => void;
};

export default function JoinRoom({ setJoined }: JoinRoomProps) {
  const [isLoading, startTransition] = useTransition();
  const socket = useSocket();

  const handleJoinRoom = useCallback(async () => {
    const joined: boolean = await socket.request("joinRoom");
    setJoined(joined);
  }, [socket, setJoined]);

  return (
    <main>
      <Button onClick={() => startTransition(handleJoinRoom)}>
        {isLoading ? "Joining..." : "Join"}
      </Button>
    </main>
  );
}
