"use client";

import { useProducer } from "@/hooks/use-producer";
import { useLocalMedia } from "@/providers/local-media-provider";
import ControlBar from "./control-bar";
import VideoGrid from "./video-grid";

export default function JoinedState() {
  const { userMedia: um, displayMedia: dm } = useLocalMedia();

  useProducer(um.audioTrack, um.mediaStream.id);
  useProducer(um.videoTrack, um.mediaStream.id);
  useProducer(dm.audioTrack, dm.mediaStream?.id ?? "", true);
  useProducer(dm.videoTrack, dm.mediaStream?.id ?? "", true);

  return (
    <div className="relative flex h-svh w-full flex-col bg-zinc-950">
      <main className="relative grid grow overflow-hidden">
        <VideoGrid />
      </main>
      <ControlBar />
    </div>
  );
}
