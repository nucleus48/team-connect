"use client";

import { withAbortController } from "@/lib/utils";
import { types } from "mediasoup-client";
import { useEffect, useMemo, useState } from "react";
import { RemoteProducer, useTransport } from "../providers/transport-provider";

export const useConsumeMedia = (remoteProducers: RemoteProducer[]) => {
  const mediaStream = useMemo(() => new MediaStream(), []);

  const audioProducer = useMemo(() => {
    return remoteProducers.find((p) => p.kind === "audio");
  }, [remoteProducers]);

  const videoProducer = useMemo(() => {
    return remoteProducers.find((p) => p.kind === "video");
  }, [remoteProducers]);

  useConsumerProducer(mediaStream, audioProducer);
  useConsumerProducer(mediaStream, videoProducer);

  return mediaStream;
};

const useConsumerProducer = (
  mediaStream: MediaStream,
  producer?: RemoteProducer,
) => {
  const [consumer, setConsumer] = useState<types.Consumer>();
  const { socketRef, deviceRef, consumerTransport } = useTransport();
  const producerId = useMemo(() => producer?.id || "", [producer]);
  const paused = useMemo(() => !!producer?.paused, [producer]);

  useEffect(() => {
    if (!producerId || !consumerTransport) return;

    const socket = socketRef.current!;

    const consumerPromise = (async () => {
      const consumerOptions = await socket.request<types.ConsumerOptions>(
        "createConsumer",
        {
          producerId,
          transportId: consumerTransport.id,
          rtpCapabilities: deviceRef.current?.rtpCapabilities,
        },
      );

      const consumer = await consumerTransport.consume(consumerOptions);
      return consumer;
    })();

    const abortController = new AbortController();

    withAbortController(
      consumerPromise.then((consumer) => {
        mediaStream.addTrack(consumer.track);
        setConsumer(consumer);
      }),
      abortController.signal,
    );

    return () => {
      abortController.abort("useConsumeProducer cleanup");
      consumerPromise.then((consumer) => {
        socket.emit("closeConsumer", consumer.id);
        mediaStream.removeTrack(consumer.track);
        consumer.track.stop();
        consumer.close();
      });
    };
  }, [socketRef, deviceRef, consumerTransport, mediaStream, producerId]);

  useEffect(() => {
    if (!consumer) return;

    if (paused) {
      socketRef.current?.emit("pauseConsumer", consumer.id);
    } else {
      socketRef.current?.emit("resumeConsumer", consumer.id);
    }
  }, [paused, socketRef, consumer]);
};
