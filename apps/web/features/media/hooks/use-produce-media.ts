"use client";

import { types } from "mediasoup-client";
import { useEffect, useMemo, useState } from "react";
import { useTransport } from "../providers/transport-provider";

export const useProduceMedia = (
  mediaStream?: MediaStream,
  enableAudio?: boolean,
  enableVideo?: boolean,
) => {
  const audioTrack = useMemo(() => {
    return mediaStream?.getAudioTracks()[0];
  }, [mediaStream]);

  const videoTrack = useMemo(() => {
    return mediaStream?.getVideoTracks()[0];
  }, [mediaStream]);

  const audioProducer = useProduceTrack(
    audioTrack,
    mediaStream?.id,
    enableAudio,
  );

  const videoProducer = useProduceTrack(
    videoTrack,
    mediaStream?.id,
    enableVideo,
  );

  return { audioProducer, videoProducer };
};

const useProduceTrack = (
  track?: MediaStreamTrack,
  streamId?: string,
  enable?: boolean,
) => {
  const [producer, setProducer] = useState<types.Producer>();
  const { socketRef, producerTransport } = useTransport();

  useEffect(() => {
    if (!track || !streamId || !producerTransport) return;

    const socket = socketRef.current;
    let producer: types.Producer | undefined;

    (async () => {
      producer = await producerTransport.produce({
        track,
        appData: { streamId },
      });

      setProducer(producer);
    })();

    return () => {
      if (producer) {
        socket?.emit("closeProducer", producer.id);
        track.stop();
      }
    };
  }, [producerTransport, socketRef, streamId, track]);

  useEffect(() => {
    if (!producer) return;

    if (enable) {
      socketRef.current?.emit("resumeProducer", producer.id);
    } else {
      socketRef.current?.emit("pauseProducer", producer.id);
    }
  }, [enable, producer, socketRef]);

  return producer;
};
