"use client";

import { useMedia } from "../providers/media-provider";
import { useTransport } from "../providers/transport-provider";
import DisplayStream from "./display-stream";
import RemoteStream from "./remote-stream";
import UserStream from "./user-stream";

export default function MediaStreams() {
  const { userStream, displayStreams } = useMedia();
  const { remoteStreams } = useTransport();

  return (
    <div className="grid">
      {userStream && (
        <UserStream className="rotate-y-180" stream={userStream} />
      )}
      {displayStreams.map((displayStream) => (
        <DisplayStream key={displayStream.id} stream={displayStream} />
      ))}
      {remoteStreams.map((remoteStream) => (
        <RemoteStream key={remoteStream.id} remoteStream={remoteStream} />
      ))}
    </div>
  );
}
