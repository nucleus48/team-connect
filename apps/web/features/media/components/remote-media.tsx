"use client";

import { useMemo } from "react";
import { useConsumerProducer } from "../hooks/use-consume-producer";
import { RemoteProducer } from "../providers/transport-provider";
import Video from "./video";

export type RemoteMediaProps = {
  remoteProducers: RemoteProducer[];
};

export default function RemoteMedia({ remoteProducers }: RemoteMediaProps) {
  const videoProducer = useMemo(() => {
    return remoteProducers.find((producer) => producer.kind === "video");
  }, [remoteProducers]);

  const audioProducer = useMemo(() => {
    return remoteProducers.find((producer) => producer.kind === "audio");
  }, [remoteProducers]);

  const audioTrack = useConsumerProducer(audioProducer);
  const videoTrack = useConsumerProducer(videoProducer);

  return <Video audioTrack={audioTrack} videoTrack={videoTrack} />;
}
