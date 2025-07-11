"use client";

import { useReducer } from "react";
import { useProduceMedia } from "../hooks/use-produce-media";
import Video from "./video";
import { cn } from "@/lib/utils";

export type DisplayStreamProps = {
  mediaStream: MediaStream;
};

export default function DisplayMedia({ mediaStream }: DisplayStreamProps) {
  const [isAudioEnabled, toggleAudioEnabled] = useReducer((t) => !t, true);
  const [isVideoEnabled, toggleVideoEnabled] = useReducer((t) => !t, true);

  useProduceMedia(mediaStream, isAudioEnabled, isVideoEnabled);

  return (
    <Video
      muted
      mediaStream={mediaStream}
      className={cn(isVideoEnabled ? "" : "opacity-0")}
    />
  );
}
