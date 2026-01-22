import { useRoom } from "@/providers/room-provider";
import { useEffect } from "react";

export function useProduceMedia(
  mediaStream: MediaStream | null,
  display = false,
) {
  const { socket, sendTransport } = useRoom();

  useEffect(() => {
    if (!mediaStream || !sendTransport) return;

    const controller = new AbortController();

    const produce = async (track: MediaStreamTrack) => {
      if (track.readyState !== "live") return;

      const producer = await sendTransport.produce({
        track,
        streamId: mediaStream.id,
        appData: { display },
      });

      track.addEventListener(
        "ended",
        () => {
          socket.emit("closeProducer", { producerId: producer.id });
        },
        { signal: controller.signal },
      );

      track.addEventListener(
        "mute",
        () => {
          socket.emit("updateProducerData", {
            producerId: producer.id,
            appData: { enabled: false },
          });
        },
        { signal: controller.signal },
      );

      track.addEventListener(
        "unmute",
        () => {
          socket.emit("updateProducerData", {
            producerId: producer.id,
            appData: { enabled: true },
          });
        },
        { signal: controller.signal },
      );

      track.addEventListener(
        "enabledchange",
        (e) => {
          const event = e as CustomEvent<{ enabled: boolean }>;

          socket.emit("updateProducerData", {
            producerId: producer.id,
            appData: { enabled: event.detail.enabled },
          });
        },
        {
          signal: controller.signal,
        },
      );

      return producer;
    };

    const audioTrack = mediaStream.getAudioTracks()[0];
    const videoTrack = mediaStream.getVideoTracks()[0];

    const producersPromise = Promise.all([
      audioTrack && produce(audioTrack),
      videoTrack && produce(videoTrack),
    ]);

    return () => {
      controller.abort();
      void producersPromise.then((producers) => {
        producers.forEach((producer) => {
          if (producer)
            socket.emit("closeProducer", { producerId: producer.id });
        });
      });
    };
  }, [mediaStream, sendTransport, socket, display]);
}
