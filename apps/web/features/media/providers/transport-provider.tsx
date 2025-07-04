"use client";

import { Device, types } from "mediasoup-client";
import { createContext, use, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export type TransportProviderProps = React.PropsWithChildren<{
  routerId: string;
}>;

export type TransportContextValue = {
  device?: Device;
  socket?: Socket;
  producerTransport?: types.Transport;
  consumerTransport?: types.Transport;
};

const TransportContext = createContext<TransportContextValue>({});

export default function TransportProvider({
  children,
  routerId,
}: TransportProviderProps) {
  const [socket, setSocket] = useState<Socket>();
  const [device, setDevice] = useState<Device>();
  const [producerTransport, setProducerTransport] = useState<types.Transport>();
  const [consumerTransport, setConsumerTransport] = useState<types.Transport>();

  useEffect(() => {
    const socket = io(`http://localhost:3030/?routerId=${routerId}`);
    const device = new Device();

    setSocket(socket);
    setDevice(device);

    let producerTransport: types.Transport;
    let consumerTransport: types.Transport;

    function socketRequest<T>(event: string, data?: unknown) {
      return new Promise<T>((res) =>
        socket?.emit(event, data, (data: T) => res(data)),
      );
    }

    async function setup() {
      const routerRtpCapabilities =
        await socketRequest<types.RtpCapabilities>("capabilities");
      await device.load({ routerRtpCapabilities });
      const transportOptions =
        await socketRequest<types.TransportOptions>("transport");

      producerTransport = device.createSendTransport(transportOptions);
      consumerTransport = device.createRecvTransport(transportOptions);

      setProducerTransport(producerTransport);
      setConsumerTransport(consumerTransport);

      const handleConnection = async (
        data: { dtlsParameters: types.DtlsParameters },
        resolve: () => void,
        reject: (error: Error) => void,
      ) => {
        try {
          await socketRequest("connect-transport", data.dtlsParameters);
          resolve();
        } catch (error) {
          reject(error as Error);
        }
      };

      producerTransport.on("connect", handleConnection);
      consumerTransport.on("connect", handleConnection);

      producerTransport.on("produce", async (data, resolve, reject) => {
        try {
          const producerId = await socketRequest<string>("produce", data);
          resolve({ id: producerId });
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
      value={{ device, socket, producerTransport, consumerTransport }}
    >
      {children}
    </TransportContext>
  );
}

export const useTransport = () => use(TransportContext);
