"use client";

import { useMemo } from "react";
import { useProduceTrack } from "../hooks/use-produce-track";
import { useDisplayMedia } from "../providers/display-media-provider";
import Video from "./video";

export default function DisplayMedia() {
  const streamId = useMemo(() => crypto.randomUUID(), []);
  const { videoTrack, audioTrack, isSharingScreen } = useDisplayMedia();

  useProduceTrack(streamId, audioTrack);
  useProduceTrack(streamId, videoTrack);

  if (!isSharingScreen) return null;

  return <Video muted audioTrack={audioTrack} videoTrack={videoTrack} />;
}
