"use client";

import { cn } from "@/lib/utils";
import { types } from "mediasoup-client";
import { HTMLAttributes, useEffect, useRef } from "react";
import { RemoteProducers, useTransport } from "../providers/transport-provider";

export type RemoteStreamProps = HTMLAttributes<HTMLVideoElement> & {
  remoteStream: RemoteProducers;
};

export default function RemoteStream({
  remoteStream,
  className,
  ...props
}: RemoteStreamProps) {
  const { device, consumerTransport, socket } = useTransport();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    function socketRequest<T>(event: string, data?: unknown) {
      return new Promise<T>((res) =>
        socket?.emit(event, data, (data: T) => res(data)),
      );
    }

    const stream = new MediaStream();
    videoRef.current!.srcObject = stream;

    async function createRemoteStream() {
      if (!device || !consumerTransport) return;

      console.log(remoteStream);
      await Promise.all(
        remoteStream.producers.map(async (producerId) => {
          const consumerOptions = await socketRequest<types.ConsumerOptions>(
            "createConsumer",
            {
              transportId: consumerTransport.id,
              producerId,
              rtpCapabilities: device.rtpCapabilities,
            },
          );

          const consumer = await consumerTransport.consume(consumerOptions);
          stream.addTrack(consumer.track);
        }),
      );
    }

    createRemoteStream();
  }, [consumerTransport, device, remoteStream, socket]);

  return (
    <video
      autoPlay
      playsInline
      className={cn("min-size-40 bg-red-600", className)}
      {...props}
      ref={videoRef}
    ></video>
  );
}
