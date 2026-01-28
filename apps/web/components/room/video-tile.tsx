"use client";

import MediaCard from "@/components/media-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, nameInitials } from "@/lib/utils";

export interface VideoTileProps {
  id: string;
  name: string;
  isLocal?: boolean;
  display?: boolean;
  className?: string;
  image?: string | null;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  isScreenShare?: boolean;
  fit?: "cover" | "contain";
  mediaStream?: MediaStream | null;
}

export default function VideoTile({
  name,
  image,
  display,
  className,
  mediaStream,
  audioEnabled,
  videoEnabled,
  isScreenShare,
  fit = "cover",
  isLocal = false,
}: VideoTileProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-2xl transition-all duration-300",
        className,
      )}
    >
      <MediaCard
        muted={isLocal || !audioEnabled}
        className={cn(
          "relative z-20 h-full w-full transition-opacity duration-300",
          isLocal && !isScreenShare && !display && "scale-x-[-1]",
          mediaStream && videoEnabled ? "opacity-100" : "opacity-0",
        )}
        videoClassName={cn(
          fit === "contain" ? "bg-black object-contain" : "object-cover",
        )}
        mediaStream={mediaStream ?? null}
      />

      {!display && (
        <>
          <div
            className="absolute inset-0 z-10 bg-cover bg-center blur-[150px]"
            style={{ backgroundImage: image ? `url(${image})` : undefined }}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Avatar className="scale-200">
              <AvatarImage src={image ?? undefined} />
              <AvatarFallback>{nameInitials(name)}</AvatarFallback>
            </Avatar>
          </div>
        </>
      )}

      {/* Name Label */}
      {!isMobile && (
        <div className="absolute bottom-4 left-4 z-20 flex max-w-[100px] items-center gap-2 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-md sm:max-w-[200px]">
          <span className="truncate">{name}</span>
          <span>{isLocal && "(You)"}</span>
        </div>
      )}

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
