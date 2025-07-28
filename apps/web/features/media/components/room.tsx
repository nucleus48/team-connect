"use client";

import { useState } from "react";
import TransportProvider from "../providers/transport-provider";
import JoinRoom from "./join-room";
import MediaStreams from "./media-streams";

export default function Room() {
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return <JoinRoom setJoined={setJoined} />;
  }

  return (
    <TransportProvider>
      <MediaStreams />
    </TransportProvider>
  );
}
