"use client";

import { useProduceMedia } from "@/hooks/use-produce-media";
import { useLocalMedia } from "@/providers/local-media-provider";
import ControlBar from "./control-bar";
import VideoGrid from "./video-grid";

export default function JoinedState() {
  const { userMedia, displayMedia } = useLocalMedia();

  // Produce both camera and screen share streams
  useProduceMedia(userMedia.mediaStream);
  useProduceMedia(displayMedia.mediaStream, true);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <main className="flex-1 p-4 pb-24">
        {/* We pass peers to the grid. The grid handles layout internally. */}
        <VideoGrid />
      </main>

      {/* Floating Control Bar */}
      <ControlBar />
    </div>
  );
}
