"use client";

import { useMemo } from "react";
import { useProduceTrack } from "../hooks/use-produce-track";
import { useDisplayMedia } from "../providers/display-media-provider";
import { useTransport } from "../providers/transport-provider";
import { useUserMedia } from "../providers/user-media-provider";
import Video from "./video";

export default function UserMedia() {
  const { remoteMedias } = useTransport();
  const { isSharingScreen } = useDisplayMedia();
  const streamId = useMemo(() => crypto.randomUUID(), []);
  const { videoTrack, audioTrack, isAudioEnabled, isVideoEnabled } =
    useUserMedia();

  const enablePictureInPicture = useMemo(() => {
    let peers = remoteMedias.length;
    if (isSharingScreen) peers++;
    return peers > 0 && peers < 3;
  }, [isSharingScreen, remoteMedias]);

  useProduceTrack(streamId, audioTrack, !isAudioEnabled);
  useProduceTrack(streamId, videoTrack);

  return (
    <Video
      flip
      muted
      audioTrack={audioTrack}
      videoTrack={videoTrack}
      audioEnabled={isAudioEnabled}
      // pictureInPicture={isVideoEnabled && enablePictureInPicture}
    />
  );
}
