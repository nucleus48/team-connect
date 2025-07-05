"use client";

import { useEffect } from "react";
import { useMedia } from "../providers/media-provider";
import { useTransport } from "../providers/transport-provider";
import LocalStream from "./local-stream";
import RemoteStream from "./remote-stream";

export default function MediaStreams() {
  const { userStream, displayStreams, startUserStream } = useMedia();
  const { remoteProducers } = useTransport();

  useEffect(() => {
    startUserStream?.({ audio: true, video: true });
  }, []);

  return (
    <div className="grid">
      {userStream && (
        <LocalStream className="rotate-y-180" stream={userStream} />
      )}
      {displayStreams.map((displayStream) => (
        <LocalStream key={displayStream.id} stream={displayStream} />
      ))}
      {remoteProducers.map((remoteStream) => (
        <RemoteStream key={remoteStream.streamId} remoteStream={remoteStream} />
      ))}
    </div>
  );
}
