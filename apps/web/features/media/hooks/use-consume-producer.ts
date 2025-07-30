"use client";

import { types } from "mediasoup-client";
import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { RemoteProducer, useTransport } from "../providers/transport-provider";

export const useConsumerProducer = (producer?: RemoteProducer) => {
  const [consumer, setConsumer] = useState<types.Consumer>();
  const { device, consumerTransport } = useTransport();
  const socket = useSocket();

  useEffect(() => {
    if (consumer) {
      return () => {
        consumer.close();
        socket.request("closeConsumer", { consumerId: consumer.id });
      };
    }
  }, [consumer, socket]);

  useEffect(() => {
    if (!producer && consumer) {
      setConsumer(undefined);
      return;
    }

    if (!consumerTransport || !device || !producer) return;
    if (producer.id === consumer?.producerId) return;

    let isMounted = true;

    const consumeProducer = async () => {
      const consumerOptions = await socket.request<types.ConsumerOptions>(
        "createConsumer",
        {
          producerId: producer.id,
          transportId: consumerTransport.id,
          rtpCapabilities: device.rtpCapabilities,
        },
      );

      const consumer = await consumerTransport.consume(consumerOptions);

      if (isMounted) {
        setConsumer(consumer);
        await socket.request("resumeConsumer", { consumerId: consumer.id });
      } else {
        consumer.close();
        await socket.request("closeConsumer", { consumerId: consumer.id });
      }
    };

    consumeProducer();

    return () => {
      isMounted = false;
    };
  }, [socket, device, consumerTransport, producer, consumer]);

  return consumer?.track;
};
