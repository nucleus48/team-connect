"use client";

import { useState } from "react";
import TransportProvider from "../providers/transport-provider";
import JoinRoom from "./join-room";
import MediaStreams from "./media-streams";
import ToggleAudio from "./ui/toggle-audio";
import ToggleVideo from "./ui/toggle-video";
import ScreenShare from "./ui/screen-share";

export default function Room() {
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return <JoinRoom setJoined={setJoined} />;
  }

  return (
    <TransportProvider>
      <div className="flex h-full flex-col overflow-hidden">
        <MediaStreams />
        <div className="flex items-center justify-center gap-8 p-4">
          <ToggleAudio />
          <ToggleVideo />
          <ScreenShare />
        </div>
      </div>
    </TransportProvider>
  );
}
