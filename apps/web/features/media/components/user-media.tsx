"use client";

import { cn } from "@/lib/utils";
import Video from "./video";
import { useUserMedia } from "../providers/user-media-provider";

export type UserMediaProps = {
  mediaStream: MediaStream;
};

export default function UserMedia({ mediaStream }: UserMediaProps) {
  const { isVideoEnabled } = useUserMedia();

  return (
    <Video
      muted
      mediaStream={mediaStream}
      className={cn("rotate-y-180", isVideoEnabled || "opacity-0")}
    />
  );
}
