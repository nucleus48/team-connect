"use client";

import { io, Socket } from "@/lib/socket";
import { Device, types } from "mediasoup-client";
import { createContext, use, useEffect, useState } from "react";

export type TransportProviderProps = React.PropsWithChildren<{
  routerId: string;
}>;

export type RemoteStream = {
  id: string;
  routerId: string;
  clientId: string;
  transportId: string;
  producers: string[];
};

export type RemoteProducer = {
  id: string;
  streamId: string;
};

export type TransportContextValue = {
  device?: Device;
  socket?: Socket;
  producerTransport?: types.Transport;
  consumerTransport?: types.Transport;
  remoteStreams: RemoteStream[];
};

const TransportContext = createContext<TransportContextValue>({
  remoteStreams: [],
});

export default function TransportProvider({
  children,
  routerId,
}: TransportProviderProps) {
  const [socket, setSocket] = useState<Socket>();
  const [device, setDevice] = useState<Device>();
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  useEffect(() => {
    const socket = io(`http://localhost:3030/?routerId=${routerId}`);
    const device = new Device();

    setSocket(socket);
    setDevice(device);
    setRemoteStreams([]);

    socket.on("join", (remoteStreams: RemoteStream[]) => {
      setRemoteStreams(remoteStreams);
    });

    socket.on("newStream", (remoteStream: RemoteStream) => {
      setRemoteStreams((remoteStreams) => [...remoteStreams, remoteStream]);
    });

    socket.on("closeStream", (streamId: string) => {
      setRemoteStreams((remoteStreams) =>
        remoteStreams.filter((remoteStream) => remoteStream.id !== streamId),
      );
    });

    socket.on("newProducer", (remoteProducer: RemoteProducer) => {
      setRemoteStreams((remoteStreams) =>
        remoteStreams.map((remoteStream) => {
          if (remoteStream.id == remoteProducer.streamId) {
            return {
              ...remoteStream,
              producers: [...remoteStream.producers, remoteProducer.id],
            };
          }

          return remoteStream;
        }),
      );
    });

    socket.on("closeProducer", (remoteProducer: RemoteProducer) => {
      setRemoteStreams((remoteStreams) =>
        remoteStreams.map((remoteStream) => {
          if (remoteStream.id == remoteProducer.streamId) {
            return {
              ...remoteStream,
              producers: remoteStream.producers.filter(
                (producerId) => producerId !== remoteProducer.id,
              ),
            };
          }

          return remoteStream;
        }),
      );
    });

    async function setup() {
      const routerRtpCapabilities = await socket.request<types.RtpCapabilities>(
        "getRouterRtpCapabilities",
      );

      await device.load({ routerRtpCapabilities });

      const producerTransportOptions =
        await socket.request<types.TransportOptions>("createWebRtcTransport");

      const consumerTransportOptions =
        await socket.request<types.TransportOptions>("createWebRtcTransport");

      const producerTransport = device.createSendTransport(
        producerTransportOptions,
      );

      const consumerTransport = device.createRecvTransport(
        consumerTransportOptions,
      );

      setProducerTransport(producerTransport);
      setConsumerTransport(consumerTransport);

      const handleConnection =
        (transportId: string) =>
        async (
          { dtlsParameters }: { dtlsParameters: types.DtlsParameters },
          resolve: () => void,
          reject: (error: Error) => void,
        ) => {
          try {
            await socket.request("connectTransport", {
              transportId,
              dtlsParameters,
            });
            resolve();
          } catch (error) {
            reject(error as Error);
          }
        };

      producerTransport.on(
        "connect",
        handleConnection(producerTransportOptions.id),
      );

      consumerTransport.on(
        "connect",
        handleConnection(consumerTransportOptions.id),
      );

      producerTransport.on("produce", async (data, resolve, reject) => {
        try {
          const producer = await socket.request<{ id: string }>(
            "createProducer",
            {
              ...data,
              appData: {
                ...data.appData,
                transportId: producerTransportOptions.id,
              },
            },
          );
          resolve(producer);
        } catch (error) {
          reject(error as Error);
        }
      });
    }

    setup();

    return () => {
      socket.disconnect();
    };
  }, [routerId]);

  return (
    <TransportContext
      value={{
        device,
        socket,
        producerTransport,
        consumerTransport,
        remoteStreams,
      }}
    >
      {children}
    </TransportContext>
  );
}

export const useTransport = () => use(TransportContext);
