"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useConsumeMedia } from "../hooks/use-consume-media";
import { RemoteProducer } from "../providers/transport-provider";
import Video from "./video";

export type RemoteMediaProps = {
  remoteProducers: RemoteProducer[];
};

export default function RemoteMedia({ remoteProducers }: RemoteMediaProps) {
  const mediaStream = useConsumeMedia(remoteProducers);
  const videoProducer = useMemo(() => {
    return remoteProducers.find((p) => p.kind === "video");
  }, [remoteProducers]);

  return (
    <Video
      mediaStream={mediaStream}
      className={cn(videoProducer?.paused && "opacity-0")}
    />
  );
}
