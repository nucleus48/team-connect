import { useRoom } from "@/providers/room-provider";
import { types } from "mediasoup-client";
import { useEffect, useRef } from "react";

export function useConsumeMedia(producerIds: string[]) {
  const { socket, device, recvTransport } = useRoom();
  const mediaStreamRef = useRef(new MediaStream());

  useEffect(() => {
    if (!recvTransport) return;

    let isMounted = true;

    const consume = async (producerId: string, transport: types.Transport) => {
      const consumeOptions = await socket.request<
        Parameters<types.Transport["consume"]>["0"]
      >("consume", {
        producerId,
        transportId: transport.id,
        rtpCapabilities: device.rtpCapabilities,
      });

      const consumer = await transport.consume(consumeOptions);

      if (isMounted) {
        mediaStreamRef.current.addTrack(consumer.track);
        socket.emit("resumeConsumer", { consumerId: consumer.id });
      }

      return consumer;
    };

    const mediaStream = mediaStreamRef.current;
    const consumersPromise = Promise.all(
      producerIds.map((id) => consume(id, recvTransport)),
    );

    return () => {
      isMounted = false;
      void consumersPromise.then((consumers) => {
        consumers.forEach((consumer) => {
          consumer.track.stop();
          mediaStream.removeTrack(consumer.track);
          socket.emit("closeConsumer", { consumerId: consumer.id });
        });
      });
    };
  }, [producerIds.toString(), recvTransport, socket, device]);

  // eslint-disable-next-line react-hooks/refs
  return mediaStreamRef.current;
}
