"use client";

import { useTransport } from "../providers/transport-provider";
import DisplayMedia from "./display-media";
import RemoteMedia from "./remote-media";
import UserMedia from "./user-media";

export default function MediaStreams() {
  const { remoteMedias } = useTransport();

  return (
    <div className="grid h-full [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-8">
      <UserMedia />
      <DisplayMedia />
      {remoteMedias.map((remoteProducers) => (
        <RemoteMedia
          key={remoteProducers[0].streamId}
          remoteProducers={remoteProducers}
        />
      ))}
    </div>
  );
}
