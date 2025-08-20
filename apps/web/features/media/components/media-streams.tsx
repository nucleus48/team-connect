"use client";

import { useTransport } from "../providers/transport-provider";
import DisplayMedia from "./display-media";
import RemoteMedia from "./remote-media";
import UserMedia from "./user-media";

export default function MediaStreams() {
  const { remoteMedias } = useTransport();

  return (
    <div className="flex h-full flex-wrap-reverse gap-4 overflow-auto p-4 *:min-w-1/3 *:flex-1 *:md:min-w-1/4 *:xl:min-w-1/5">
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
