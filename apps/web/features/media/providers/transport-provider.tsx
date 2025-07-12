"use client";

import { io, Socket } from "@/lib/socket";
import { withAbortController } from "@/lib/utils";
import { Device, types } from "mediasoup-client";
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type RemoteProducer = {
  id: string;
  streamId: string;
  kind: types.MediaKind;
  paused: boolean;
};

export type TransportProviderProps = React.PropsWithChildren<{
  routerId: string;
}>;

export type TransportContextValue = {
  socketRef: React.RefObject<Socket | null>;
  deviceRef: React.RefObject<Device | null>;
  producerTransport?: types.Transport;
  consumerTransport?: types.Transport;
  remoteMedias: RemoteProducer[][];
  removeRemoteProducer: (producerId: string) => void;
};

const TransportContext = createContext<TransportContextValue | null>(null);

export default function TransportProvider({
  children,
  routerId,
}: TransportProviderProps) {
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();
  const [remoteProducers, setRemoteProducers] = useState<RemoteProducer[]>([]);

  const remoteMedias = useMemo(() => {
    return Object.values(
      Object.groupBy(remoteProducers, (item) => item.streamId),
    ).filter((v) => !!v);
  }, [remoteProducers]);

  const socketRef = useRef<Socket>(null);
  const deviceRef = useRef<Device>(null);

  const removeRemoteProducer = useCallback((producerId: string) => {
    setRemoteProducers((remoteProducers) =>
      remoteProducers.filter(
        (remoteProducer) => remoteProducer.id !== producerId,
      ),
    );
  }, []);

  useLayoutEffect(() => {
    const socket = io(`http://localhost:3030/?routerId=${routerId}`);
    const device = new Device();

    socketRef.current = socket;
    deviceRef.current = device;

    setRemoteProducers([]);

    socket.on("producers", (remoteProducers: RemoteProducer[]) => {
      setRemoteProducers(remoteProducers);
    });

    socket.on("newProducer", (remoteProducer: RemoteProducer) => {
      setRemoteProducers((remoteProducers) => [
        ...remoteProducers,
        remoteProducer,
      ]);
    });

    socket.on("pauseProducer", (producerId: string) => {
      setRemoteProducers((remoteProducers) =>
        remoteProducers.map((remoteProducer) => {
          if (remoteProducer.id === producerId) {
            return {
              ...remoteProducer,
              paused: true,
            };
          }

          return remoteProducer;
        }),
      );
    });

    socket.on("resumeProducer", (producerId: string) => {
      setRemoteProducers((remoteProducers) =>
        remoteProducers.map((remoteProducer) => {
          if (remoteProducer.id === producerId) {
            return {
              ...remoteProducer,
              paused: false,
            };
          }

          return remoteProducer;
        }),
      );
    });

    socket.on("closeProducer", (producerId: string) => {
      setRemoteProducers((remoteProducers) =>
        remoteProducers.filter(
          (remoteProducer) => remoteProducer.id !== producerId,
        ),
      );
    });

    async function initTransports() {
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
    }

    const abortController = new AbortController();
    withAbortController(initTransports(), abortController.signal);

    return () => {
      socket.disconnect();
      abortController.abort("useLayout cleanup");
    };
  }, [routerId]);

  return (
    <TransportContext
      value={{
        socketRef,
        deviceRef,
        producerTransport,
        consumerTransport,
        remoteMedias,
        removeRemoteProducer,
      }}
    >
      {children}
    </TransportContext>
  );
}

export const useTransport = () => use(TransportContext)!;
