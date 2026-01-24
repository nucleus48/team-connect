import { useRoom } from "@/providers/room-provider";
import { useEffect } from "react";

export function useProduceMedia(
  mediaStream: MediaStream | null,
  display = false,
) {
  const { socket, sendTransport, setIsCurrentUserPresenting } = useRoom();

  useEffect(() => {
    if (!mediaStream || !sendTransport) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const produce = async (track: MediaStreamTrack) => {
      if (track.readyState !== "live") return;

      const producer = await sendTransport.produce({
        track,
        streamId: mediaStream.id,
        appData: { display, enabled: track.enabled },
      });

      if (display) setIsCurrentUserPresenting(true);

      const handleCloseProducer = () => {
        socket.emit("closeProducer", { producerId: producer.id });
        if (display) setIsCurrentUserPresenting(false);
      };

      const handleUpdateProducer = () => {
        setTimeout(
          () => {
            socket.emit("updateProducerData", {
              producerId: producer.id,
              appData: { enabled: track.enabled },
            });
          },
          track.enabled ? 1000 : 0,
        );
      };

      track.addEventListener("ended", handleCloseProducer, { signal });
      track.addEventListener("mute", handleUpdateProducer, { signal });
      track.addEventListener("unmute", handleUpdateProducer, { signal });
      track.addEventListener("enabledchange", handleUpdateProducer, { signal });

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
  }, [mediaStream, sendTransport, socket, display, setIsCurrentUserPresenting]);
}
