"use client";

import { HTMLAttributes, useEffect } from "react";
import { useTransport } from "../providers/transport-provider";

export type LocalStreamProps = HTMLAttributes<HTMLVideoElement> & {
  stream: MediaStream;
};

export default function LocalStream({ stream, ...props }: LocalStreamProps) {
  const { producerTransport } = useTransport();

  useEffect(() => {
    if (!producerTransport) return;

    stream.getTracks().forEach((track) => {
      producerTransport.produce({
        track,
        appData: { streamId: stream.id },
      });
    });
  }, [stream, producerTransport]);

  return (
    <video
      autoPlay
      {...props}
      ref={(ref) => {
        if (ref) {
          ref.srcObject = new MediaStream(stream.getVideoTracks());
        }
      }}
    ></video>
  );
}
