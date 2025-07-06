"use client";

import { io, Socket } from "@/lib/socket";
import { Device, types } from "mediasoup-client";
import { createContext, use, useCallback, useEffect, useState } from "react";

export type TransportProviderProps = React.PropsWithChildren<{
  routerId: string;
}>;

export type RemoteProducers = {
  routerId: string;
  streamId: string;
  producers: string[];
};

export type RemoteProducer = {
  producerId: string;
  streamId: string;
};

export type TransportContextValue = {
  device?: Device;
  socket?: Socket;
  producerTransport?: types.Transport;
  consumerTransport?: types.Transport;
  remoteProducers: RemoteProducers[];
  removeRemoteProducers?: (streamId: string) => void;
};

const TransportContext = createContext<TransportContextValue>({
  remoteProducers: [],
});

export default function TransportProvider({
  children,
  routerId,
}: TransportProviderProps) {
  const [socket, setSocket] = useState<Socket>();
  const [device, setDevice] = useState<Device>();
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();
  const [remoteProducers, setRemoteProducers] = useState<RemoteProducers[]>([]);

  const removeRemoteProducers = useCallback((streamId: string) => {
    setRemoteProducers((prev) =>
      prev.filter((stream) => stream.streamId !== streamId),
    );
  }, []);

  useEffect(() => {
    const socket = io(`http://localhost:3030/?routerId=${routerId}`);
    const device = new Device();

    setSocket(socket);
    setDevice(device);
    setRemoteProducers([]);

    let producerTransport: types.Transport;
    let consumerTransport: types.Transport;

    socket.on("join", (remoteProducers: RemoteProducers[]) => {
      setRemoteProducers(remoteProducers);
    });

    socket.on("newStream", (remoteProducers: RemoteProducers) => {
      setRemoteProducers((prev) => [...prev, remoteProducers]);
    });

    socket.on("removeStream", (remoteProducers: RemoteProducers) => {
      setRemoteProducers((prev) =>
        prev.filter((stream) => stream.streamId !== remoteProducers.streamId),
      );
    });

    socket.on("newProducer", (remoteProducer: RemoteProducer) => {
      setRemoteProducers((prev) =>
        prev.map((producers) => {
          if (producers.streamId == remoteProducer.streamId) {
            return {
              ...producers,
              producers: Array.from(
                new Set([...producers.producers, remoteProducer.producerId]),
              ),
            };
          }

          return producers;
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

      producerTransport = device.createSendTransport(producerTransportOptions);
      consumerTransport = device.createRecvTransport(consumerTransportOptions);

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
      producerTransport?.close();
      consumerTransport?.close();
    };
  }, [routerId]);

  return (
    <TransportContext
      value={{
        device,
        socket,
        producerTransport,
        consumerTransport,
        remoteProducers,
        removeRemoteProducers,
      }}
    >
      {children}
    </TransportContext>
  );
}

export const useTransport = () => use(TransportContext);
