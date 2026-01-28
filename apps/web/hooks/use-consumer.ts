import { useRoom } from "@/providers/room-provider";
import * as mediasoup from "mediasoup-client";
import { useEffect, useState } from "react";

export function useConsumer(producerId: string | null) {
  const { socket, device, recvTransport } = useRoom();
  const [consumer, setConsumer] = useState<mediasoup.types.Consumer | null>(
    null,
  );

  useEffect(() => {
    if (!recvTransport || !producerId || !device.loaded) return;

    let isMounted = true;
    let currentConsumer: mediasoup.types.Consumer | null = null;

    void (async () => {
      const consumeOptions = await socket.request<
        Parameters<mediasoup.types.Transport["consume"]>["0"]
      >("consume", {
        producerId,
        transportId: recvTransport.id,
        rtpCapabilities: device.rtpCapabilities,
      });

      const consumer = await recvTransport.consume(consumeOptions);
      socket.emit("resumeConsumer", { consumerId: consumer.id });

      if (isMounted as boolean) {
        setConsumer(consumer);
        currentConsumer = consumer;
        return;
      }

      socket.emit("closeConsumer", { consumerId: consumer.id });
      consumer.close();
    })();

    return () => {
      isMounted = false;
      if (!currentConsumer) return;
      socket.emit("closeConsumer", { consumerId: currentConsumer.id });
      currentConsumer.close();
    };
  }, [producerId, socket, device, recvTransport]);

  return consumer?.track ?? null;
}
