"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useSocket } from "../providers/socket-provider";

export type JoinRoomProps = {
  setJoined: (joined: boolean) => void;
};

export type InRoomState = "present" | "absent" | "loading";

export default function JoinRoom({ setJoined }: JoinRoomProps) {
  const [inRoom, setInRoom] = useState<InRoomState>("loading");
  const [isLoading, startTransition] = useTransition();
  const socket = useSocket();

  const handleJoinRoom = useCallback(async () => {
    const joined: boolean = await socket.request("joinRoom");
    setJoined(joined);
  }, [socket, setJoined]);

  useEffect(() => {
    let isMounted = true;

    async function checkRoomStatus() {
      const inRoom = await socket.request<boolean>("inRoom");

      if (isMounted) {
        setInRoom(inRoom ? "present" : "absent");
      }
    }

    checkRoomStatus();

    return () => {
      isMounted = false;
    };
  }, [socket]);

  if (inRoom === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {inRoom === "present" ? (
        <Button onClick={() => startTransition(handleJoinRoom)}>Switch</Button>
      ) : (
        <Button onClick={() => startTransition(handleJoinRoom)}>
          {isLoading ? "Joining..." : "Join"}
        </Button>
      )}
    </main>
  );
}
