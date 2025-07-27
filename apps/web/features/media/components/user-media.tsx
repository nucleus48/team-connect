"use client";

import { useMemo } from "react";
import { useProduceTrack } from "../hooks/use-produce-track";
import { useUserMedia } from "../providers/user-media-provider";
import Video from "./video";

export default function UserMedia() {
  const streamId = useMemo(() => crypto.randomUUID(), []);
  const { videoTrack, audioTrack } = useUserMedia();

  useProduceTrack(streamId, audioTrack);
  useProduceTrack(streamId, videoTrack);

  return (
    <Video
      muted
      className="rotate-y-180"
      audioTrack={audioTrack}
      videoTrack={videoTrack}
    />
  );
}
