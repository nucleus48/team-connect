"use client";

import { types } from "mediasoup-client";
import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { useTransport } from "../providers/transport-provider";

export const useProduceTrack = (streamId: string, track?: MediaStreamTrack) => {
  const [producer, setProducer] = useState<types.Producer>();
  const { producerTransport } = useTransport();
  const socket = useSocket();

  useEffect(() => {
    if (producer) {
      return () => {
        socket.request("closeProducer", { producerId: producer.id });
      };
    }
  }, [producer, socket]);

  useEffect(() => {
    if (producer) {
      if (track?.readyState === "live" && producer.track?.id !== track.id) {
        producer.replaceTrack({ track });
      } else if (track?.readyState !== "live") {
        setProducer(undefined);
      }

      return;
    }

    if (!producerTransport || track?.readyState !== "live") return;

    let isMounted = true;

    const produceTrack = async () => {
      const producer = await producerTransport.produce({
        track,
        appData: { streamId },
      });

      if (isMounted) {
        setProducer(producer);
      } else {
        await socket.request("closeProducer", { producerId: producer.id });
      }
    };

    produceTrack();

    return () => {
      isMounted = false;
    };
  }, [producerTransport, streamId, track, socket, producer]);
};
