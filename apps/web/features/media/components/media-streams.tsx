"use client";

import { useDisplayMedia } from "../providers/display-media-provider";
import { useTransport } from "../providers/transport-provider";
import { useUserMedia } from "../providers/user-media-provider";
import DisplayMedia from "./display-media";
import RemoteMedia from "./remote-media";
import UserMedia from "./user-media";

export default function MediaStreams() {
  const { mediaStream } = useUserMedia();
  const { displayMedias } = useDisplayMedia();
  const { remoteMedias } = useTransport();

  return (
    <div className="grid h-full [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-8">
      {mediaStream && <UserMedia mediaStream={mediaStream} />}
      {displayMedias.map((mediaStream) => (
        <DisplayMedia key={mediaStream.id} mediaStream={mediaStream} />
      ))}
      {remoteMedias.map((remoteProducers) => (
        <RemoteMedia
          key={remoteProducers[0]?.streamId || JSON.stringify(remoteProducers)}
          remoteProducers={remoteProducers}
        />
      ))}
    </div>
  );
}
