import { useRoom } from "@/providers/room-provider";
import * as mediasoup from "mediasoup-client";
import { useEffect, useEffectEvent, useRef } from "react";

export function useProducer(
  track: MediaStreamTrack | null,
  streamId: string,
  display = false,
) {
  const { sendTransport, socket, setIsCurrentUserPresenting } = useRoom();
  const producerRef = useRef<mediasoup.types.Producer>(null);
  const controllerRef = useRef<AbortController>(null);

  const closeProducer = useEffectEvent(() => {
    if (!producerRef.current) return;
    socket.emit("closeProducer", { producerId: producerRef.current.id });
    if (display) setIsCurrentUserPresenting(false);
  });

  const produce = useEffectEvent(
    async (
      track: MediaStreamTrack | null,
      transport: mediasoup.types.Transport,
    ) => {
      if (track && track.readyState !== "live") return;

      if (producerRef.current) {
        await producerRef.current.replaceTrack({ track });

        socket.emit("updateProducerData", {
          producerId: producerRef.current.id,
          appData: { enabled: !!track?.enabled },
        });
      } else if (track) {
        producerRef.current = await transport.produce({
          track,
          streamId,
          appData: { display, enabled: track.enabled },
        });

        if (display) setIsCurrentUserPresenting(true);
      }

      controllerRef.current ??= new AbortController();
      const signal = controllerRef.current.signal;

      track?.addEventListener("ended", closeProducer, { signal });
      track?.addEventListener(
        "enabled",
        () => {
          if (producerRef.current) {
            socket.emit("updateProducerData", {
              producerId: producerRef.current.id,
              appData: { enabled: track.enabled },
            });
          }
        },
        { signal },
      );
    },
  );

  useEffect(() => {
    return closeProducer;
  }, []);

  useEffect(() => {
    if (!sendTransport) return;
    void produce(track, sendTransport);

    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [track, sendTransport]);
}
