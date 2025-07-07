"use client";

import { types } from "mediasoup-client";
import { useEffect, useRef, useState } from "react";
import { RemoteStream, useTransport } from "../providers/transport-provider";

export const useConsumeStream = (remoteStream: RemoteStream) => {
  const [stream, setStream] = useState<MediaStream>();
  const { device, consumerTransport, socket } = useTransport();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const stream = new MediaStream();
    videoRef.current!.srcObject = stream;
    setStream(stream);
  }, []);

  useEffect(() => {
    async function createRemoteStream() {
      if (!socket || !consumerTransport || !device || !stream) return;

      const tracks = await Promise.all(
        remoteStream.producers.map(async (producerId) => {
          const consumerOptions = await socket.request<types.ConsumerOptions>(
            "createConsumer",
            {
              producerId,
              transportId: consumerTransport.id,
              rtpCapabilities: device.rtpCapabilities,
            },
          );

          const consumer = await consumerTransport.consume(consumerOptions);
          return consumer.track;
        }),
      );

      stream.getTracks().forEach((track) => stream.removeTrack(track));
      tracks.forEach((track) => stream.addTrack(track));
    }

    createRemoteStream();
  }, [consumerTransport, device, remoteStream, socket, stream]);

  return videoRef;
};
