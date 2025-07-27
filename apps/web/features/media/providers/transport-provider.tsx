"use client";

import { Device, types } from "mediasoup-client";
import { createContext, use, useEffect, useMemo, useState } from "react";
import { useSocket } from "./socket-provider";

export type RemoteProducer = {
  id: string;
  streamId: string;
  kind: types.MediaKind;
};

export type TransportContextValue = {
  device?: Device;
  producerTransport?: types.Transport;
  consumerTransport?: types.Transport;
  remoteMedias: RemoteProducer[][];
};

const TransportContext = createContext<TransportContextValue | null>(null);

export default function TransportProvider({
  children,
}: React.PropsWithChildren) {
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();
  const [remoteProducers, setRemoteProducers] = useState<RemoteProducer[]>([]);
  const [device, setDevice] = useState<Device>();

  const socket = useSocket();

  const remoteMedias = useMemo(() => {
    return Object.values(
      Object.groupBy(remoteProducers, (item) => item.streamId),
    ).filter((v) => !!v);
  }, [remoteProducers]);

  useEffect(() => {
    let isMounted = true;

    async function initTransport() {
      const routerRtpCapabilities = await socket.request<types.RtpCapabilities>(
        "getRouterRtpCapabilities",
      );

      const device = new Device();
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

      const handleConnection =
        (transportId: string) =>
        async (
          { dtlsParameters }: { dtlsParameters: types.DtlsParameters },
          resolve: () => void,
          reject: (error: Error) => void,
        ) => {
          try {
            const connected = await socket.request<boolean>(
              "connectTransport",
              {
                transportId,
                dtlsParameters,
              },
            );

            if (!connected) throw new Error("connectTransport failed");

            resolve();
          } catch (error) {
            reject(error as Error);
          }
        };

      producerTransport.on("connect", handleConnection(producerTransport.id));
      consumerTransport.on("connect", handleConnection(consumerTransport.id));

      producerTransport.on("produce", async (data, resolve, reject) => {
        try {
          const producer = await socket.request<{ id: string }>(
            "createProducer",
            {
              ...data,
              appData: {
                ...data.appData,
                transportId: producerTransport.id,
              },
            },
          );
          resolve(producer);
        } catch (error) {
          reject(error as Error);
        }
      });

      const producers = await socket.request<RemoteProducer[]>("getProducers");

      const handleNewProducer = (remoteProducer: RemoteProducer) => {
        setRemoteProducers((remoteProducers) => [
          ...remoteProducers,
          remoteProducer,
        ]);
      };

      const handleCloseProducer = (producerId: string) => {
        setRemoteProducers((remoteProducers) =>
          remoteProducers.filter(
            (remoteProducer) => remoteProducer.id !== producerId,
          ),
        );
      };

      if (isMounted) {
        setDevice(device);
        setRemoteProducers(producers);
        setProducerTransport(producerTransport);
        setConsumerTransport(consumerTransport);

        socket.on("newProducer", handleNewProducer);
        socket.on("closeProducer", handleCloseProducer);
      } else {
        producerTransport.close();
        consumerTransport.close();
      }
    }

    initTransport();

    return () => {
      isMounted = false;
    };
  }, [socket]);

  return (
    <TransportContext
      value={{
        device,
        producerTransport,
        consumerTransport,
        remoteMedias,
      }}
    >
      {children}
    </TransportContext>
  );
}

export const useTransport = () => use(TransportContext)!;
