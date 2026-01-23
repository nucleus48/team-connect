"use client";

import MediaCard from "@/components/media-card";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  id: string;
  mediaStream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isScreenShare?: boolean;
  muted?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}

export default function VideoTile({
  mediaStream,
  name,
  isLocal = false,
  isScreenShare,
  muted,
  className,
  fit = "cover",
}: VideoTileProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl transition-all duration-300",
        className,
      )}
    >
      <MediaCard
        muted={isLocal || muted}
        className={cn(
          "h-full w-full transition-opacity duration-300",
          isLocal && !isScreenShare && "scale-x-[-1]",
          mediaStream ? "opacity-100" : "opacity-0",
        )}
        videoClassName={cn(
          fit === "contain" ? "bg-black object-contain" : "object-cover",
        )}
        mediaStream={mediaStream}
      />

      {/* Fallback / Loading State */}
      {!mediaStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-700" />
          </div>
        </div>
      )}

      {/* Name Label */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
        <span>{name}</span>
        {isLocal && <span>(You)</span>}
      </div>

      {/* Status Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Show mute icon if we know they are muted (this prop logic requires state knowledge) 
             For now, we can just show it if `muted` is explicitly active from props, 
             though usually `muted` prop in <video> means "local playback muted". 
             We might want a visual indicator separate from the playback mute. 
         */}
      </div>
    </div>
  );
}
