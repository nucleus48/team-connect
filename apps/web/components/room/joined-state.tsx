"use client";

import { useProduceMedia } from "@/hooks/use-produce-media";
import { useLocalMedia } from "@/providers/local-media-provider";
import ControlBar from "./control-bar";
import VideoGrid from "./video-grid";

export default function JoinedState() {
  const { userMedia, displayMedia } = useLocalMedia();

  useProduceMedia(userMedia.mediaStream);
  useProduceMedia(displayMedia.mediaStream, true);

  return (
    <div className="relative flex h-svh w-full flex-col bg-zinc-950">
      <main className="relative grid grow overflow-hidden">
        <VideoGrid />
      </main>
      <ControlBar />
    </div>
  );
}
