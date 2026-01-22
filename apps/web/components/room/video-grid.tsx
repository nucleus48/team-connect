"use client";

import MediaCard from "@/components/media-card";
import { cn } from "@/lib/utils";
import { useLocalMedia } from "@/providers/local-media-provider";
import { useRoom } from "@/providers/room-provider";
import { PeerCard } from "./peer-card";

export default function VideoGrid() {
  const { peers } = useRoom();
  const { userMedia, displayMedia } = useLocalMedia();

  // We should count how many items we are showing to adjust grid keys if needed
  // But CSS grid auto-fit is powerful enough.

  return (
    <div className="grid h-full max-h-[calc(100vh-100px)] w-full grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {/* My Camera */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
        <MediaCard
          muted
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            // Mirror local video
            "scale-x-[-1]",
            userMedia.videoEnabled ? "opacity-100" : "opacity-0",
          )}
          mediaStream={userMedia.mediaStream}
        />
        <div className="absolute bottom-4 left-4 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
          You
        </div>
      </div>

      {/* My Screen Share (if any) */}
      {displayMedia.mediaStream && (
        <div className="ring-primary relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl ring-2">
          <MediaCard
            className="h-full w-full bg-black object-contain"
            mediaStream={displayMedia.mediaStream}
            muted
          />
          <div className="absolute bottom-4 left-4 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
            Your Screen
          </div>
        </div>
      )}

      {/* Remote Peers */}
      {peers.map((peer) => (
        <PeerCard key={peer.peerId} peer={peer} />
      ))}
    </div>
  );
}
