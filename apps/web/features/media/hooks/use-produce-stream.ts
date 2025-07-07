"use client";

import { useEffect, useRef } from "react";
import { useTransport } from "../providers/transport-provider";

export const useProduceStream = (stream: MediaStream) => {
  const { producerTransport, socket } = useTransport();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current!.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (!producerTransport) return;

    const producers = stream.getTracks().map((track) => {
      return producerTransport.produce({
        track,
        appData: { streamId: stream.id },
      });
    });

    return () => {
      producers.map(async (producer) => {
        socket?.request("closeProducer", {
          streamId: stream.id,
          producerId: (await producer).id,
        });
      });
    };
  }, [stream, socket, producerTransport]);

  return videoRef;
};
