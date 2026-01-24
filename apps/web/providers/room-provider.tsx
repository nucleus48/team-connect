"use client";

import JoinedState from "@/components/room/joined-state";
import LobbyState from "@/components/room/lobby-state";
import { io, Socket } from "@/lib/socket";
import {
  RemotePeer,
  RemoteProducer,
  RemoteProducerData,
} from "@repo/types/api/room";
import { Device, types } from "mediasoup-client";
import { createContext, use, useEffect, useEffectEvent, useState } from "react";

type RoomState = "lobby" | "joined" | "lost";

export interface RoomContextValue {
  roomId: string;
  socket: Socket;
  device: Device;
  peers: RemotePeer[];
  producers: RemoteProducer[];
  roomState: RoomState;
  joinRoom: () => Promise<void>;
  sendTransport?: types.Transport;
  recvTransport?: types.Transport;
  isCurrentUserPresenting: boolean;
  setIsCurrentUserPresenting: (value: boolean) => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

const getSocket = (roomId: string) => {
  return io(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? ""}/room`, {
    autoConnect: false,
    withCredentials: true,
    query: { roomId },
  });
};

const getDevice = () => {
  if (typeof window === "undefined") return {} as Device;
  return new Device();
};

export function Room({ roomId }: { roomId: string }) {
  const [device] = useState(getDevice);
  const [socket] = useState(getSocket.bind(null, roomId));
  const [roomState, setRoomState] = useState<RoomState>("lobby");
  const [sendTransport, setSendTransport] = useState<types.Transport>();
  const [recvTransport, setRecvTransport] = useState<types.Transport>();
  const [peers, setPeers] = useState<RemotePeer[]>([]);
  const [producers, setProducers] = useState<RemoteProducer[]>([]);
  const [isCurrentUserPresenting, setIsCurrentUserPresenting] = useState(false);

  const handleSetIsCurrentUserPresenting = (value: boolean) => {
    setIsCurrentUserPresenting(value);

    if (value) {
      setPeers((peers) =>
        peers.map((peer) => ({ ...peer, presenting: false })),
      );
    }
  };

  const joinRoom = async () => {
    const producers = await socket.request<RemoteProducer[]>("joinRoom");
    setProducers((prev) =>
      uniqueMerge([...prev, ...producers], (p) => p.producerId),
    );
    setRoomState("joined");
  };

  const loadDevice = async () => {
    const routerRtpCapabilities = await socket.request<types.RtpCapabilities>(
      "getRouterRtpCapabilities",
    );
    await device.load({ routerRtpCapabilities });
  };

  const initializeSendTransport = async () => {
    const createOptions = await socket.request<
      Parameters<Device["createSendTransport"]>["0"]
    >("createWebRtcTransport");
    const transport = device.createSendTransport(createOptions);

    transport.addListener("connect", ({ dtlsParameters }, res, rej) => {
      void socket
        .request("connectWebRtcTransport", {
          transportId: transport.id,
          dtlsParameters,
        })
        .then(res)
        .catch(rej);
    });

    transport.addListener(
      "produce",
      ({ kind, rtpParameters, appData }, res, rej) => {
        if (device.canProduce(kind)) {
          void socket
            .request<{ id: string }>("produce", {
              transportId: transport.id,
              kind,
              rtpParameters,
              appData,
            })
            .then(res)
            .catch(rej);
        }
      },
    );

    setSendTransport(transport);
  };

  const initializeRecvTransport = async () => {
    const createOptions = await socket.request<
      Parameters<Device["createRecvTransport"]>["0"]
    >("createWebRtcTransport");
    const transport = device.createRecvTransport(createOptions);

    transport.addListener("connect", ({ dtlsParameters }, res, rej) => {
      void socket
        .request("connectWebRtcTransport", {
          transportId: transport.id,
          dtlsParameters,
        })
        .then(res)
        .catch(rej);
    });

    setRecvTransport(transport);
  };

  const initializeDevice = useEffectEvent(async () => {
    await loadDevice();
    await Promise.all([initializeSendTransport(), initializeRecvTransport()]);
  });

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("getOtherPeers", (peers: RemotePeer[]) => {
        setPeers((prev) => uniqueMerge([...prev, ...peers], (p) => p.peerId));
      });

      socket.on("newPeer", (peer: RemotePeer) => {
        setPeers((peers) => uniqueMerge([...peers, peer], (p) => p.peerId));
      });

      socket.on("removePeer", (data: { peerId: string }) => {
        setPeers((peers) =>
          peers.filter((peer) => peer.peerId !== data.peerId),
        );
        setProducers((producers) =>
          producers.filter((producer) => producer.peerId !== data.peerId),
        );
      });

      socket.on("presenter", (data: { peerId: string }) => {
        setPeers((peers) =>
          peers.map((peer) =>
            peer.peerId === data.peerId ? { ...peer, presenting: true } : peer,
          ),
        );
        setIsCurrentUserPresenting(false);
      });

      socket.on("stopPresenting", () => {
        setPeers((peers) =>
          peers.map((peer) => ({ ...peer, presenting: false })),
        );
        setIsCurrentUserPresenting(false);
      });

      socket.on("newProducer", (producer: RemoteProducer) => {
        setProducers((producers) =>
          uniqueMerge([...producers, producer], (p) => p.producerId),
        );
      });

      socket.on(
        "updateProducerData",
        (data: { producerId: string; appData: RemoteProducerData }) => {
          setProducers((producers) =>
            producers.map((producer) =>
              producer.producerId === data.producerId
                ? {
                    ...producer,
                    appData: { ...producer.appData, ...data.appData },
                  }
                : producer,
            ),
          );
        },
      );

      socket.on("removeProducer", (data: { producerId: string }) => {
        setProducers((producers) =>
          producers.filter(
            (producer) => producer.producerId !== data.producerId,
          ),
        );
      });
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (roomState !== "joined") return;
    void initializeDevice();
  }, [roomState]);

  return (
    <RoomContext
      value={{
        roomId,
        socket,
        device,
        peers,
        producers,
        roomState,
        joinRoom,
        sendTransport,
        recvTransport,
        isCurrentUserPresenting,
        setIsCurrentUserPresenting: handleSetIsCurrentUserPresenting,
      }}
    >
      {roomState === "lobby" && <LobbyState />}
      {roomState === "joined" && <JoinedState />}
    </RoomContext>
  );
}

export const useRoom = () => {
  const context = use(RoomContext);

  if (!context) {
    throw new Error("useRoom must be used within Room");
  }

  return context;
};

function uniqueMerge<T>(arr: T[], keyFn: (item: T) => string) {
  const map = new Map<string, T>();

  for (const item of arr) {
    map.set(keyFn(item), item);
  }

  return Array.from(map.values());
}
