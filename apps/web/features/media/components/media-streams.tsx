"use client";

import { useMemo } from "react";
import { useDisplayMedia } from "../providers/display-media-provider";
import { useTransport } from "../providers/transport-provider";
import DisplayMedia from "./display-media";
import RemoteMedia from "./remote-media";
import UserMedia from "./user-media";

export default function MediaStreams() {
  const { remoteMedias } = useTransport();
  const { isSharingScreen } = useDisplayMedia();
  const [rows, cols] = useMemo(() => {
    const count = remoteMedias.length + Number(isSharingScreen) + 1;
    const rows = Math.floor(Math.sqrt(count));
    const cols = Math.ceil(count / rows);
    return [rows, cols];
  }, [isSharingScreen, remoteMedias]);

  return (
    <div
      className="mx-auto grid h-full w-max max-w-full gap-8 overflow-hidden px-4 pt-4"
      style={{
        gridTemplate: `repeat(${rows}, minmax(0, 1fr)) / repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
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
