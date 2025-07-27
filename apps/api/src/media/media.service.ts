import { RoomsService } from "@/rooms/rooms.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { Socket } from "socket.io";
import { MediaPeer } from "./media.peer";
import { MediaWorkers } from "./media.workers";

type Client = Pick<Socket, "id" | "roomId" | "user">;

@Injectable()
export class MediaService {
  private readonly rooms: Map<
    string,
    types.Router<{ peers: Map<string, MediaPeer> }>
  > = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaWorkers: MediaWorkers,
    private readonly roomsService: RoomsService,
  ) {}

  private getRoom(client: Client) {
    if (this.rooms.has(client.roomId)) {
      return this.rooms.get(client.roomId)!;
    } else {
      throw new WsException("Room does not exist");
    }
  }

  private getPeer(client: Client) {
    const peers = this.getRoom(client).appData.peers;

    if (peers.has(client.id)) {
      return peers.get(client.id)!;
    } else {
      throw new WsException("Peer does not exist");
    }
  }

  private async createRoom(client: Client) {
    const room = await this.mediaWorkers.worker.createRouter({
      appData: { peers: new Map<string, MediaPeer>() },
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    });

    const closeRoom = () => {
      this.rooms.delete(room.id);
      room?.close();
    };

    room.addListener("workerclose", closeRoom);
    this.rooms.set(client.roomId, room);

    return room;
  }

  async joinRoom(client: Client & Pick<Socket, "join" | "to">) {
    const userRoles = await this.roomsService.getUserRoles({
      userId: client.user.userId,
      roomId: client.roomId,
    });

    if (userRoles.length === 0) {
      const admins = await this.roomsService.getAdminUsers({
        roomId: client.roomId,
      });

      try {
        await new Promise((resolve, reject) =>
          client
            .to(admins)
            .emit("requestJoin", client.user.userId, resolve, reject),
        );
      } catch {
        return false;
      }
    }

    const room =
      this.rooms.get(client.roomId) ?? (await this.createRoom(client));
    const peer = new MediaPeer(client.user.userId, room);
    room.appData.peers.set(client.id, peer);
    await client.join([client.roomId, client.user.userId]);

    return true;
  }

  inRoom(client: Client) {
    try {
      const peers = this.getRoom(client).appData.peers;

      for (const peer of peers.values()) {
        if (peer.userId === client.user.userId) return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  getRouterRtpCapabilities(client: Client) {
    try {
      return this.getPeer(client).getRouterRtpCapabilities();
    } catch {
      return {};
    }
  }

  async createWebRtcTransport(client: Client) {
    try {
      const transport = await this.getPeer(client).createWebRtcTransport(
        this.configService.getOrThrow<string>("ANNOUNCED_IP"),
      );

      return {
        id: transport.id,
        dtlsParameters: transport.dtlsParameters,
        iceCandidates: transport.iceCandidates,
        iceParameters: transport.iceParameters,
        sctpParameters: transport.sctpParameters,
      };
    } catch {
      return {};
    }
  }

  async connectTransport(
    client: Client,
    transportId: string,
    dtlsParameters: types.DtlsParameters,
  ) {
    try {
      await this.getPeer(client).connectTransport(transportId, dtlsParameters);
      return true;
    } catch {
      return false;
    }
  }

  async produce(
    client: Client & Pick<Socket, "to">,
    transportId: string,
    streamId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    try {
      const producer = await this.getPeer(client).produce(
        transportId,
        streamId,
        kind,
        rtpParameters,
      );

      producer.addListener("transportclose", () =>
        this.closeProducer(client, producer.id),
      );

      client.to(client.roomId).emit("newProducer", {
        streamId,
        id: producer.id,
        kind: producer.kind,
      });

      return { id: producer.id };
    } catch {
      return {};
    }
  }

  getProducers(client: Client) {
    try {
      const peers = this.getRoom(client).appData.peers;
      const producers = Array.from(peers.values()).flatMap((peer) =>
        peer.getProducers(),
      );

      return producers;
    } catch {
      return [];
    }
  }

  closeProducer(client: Client & Pick<Socket, "to">, producerId: string) {
    try {
      this.getPeer(client).closeProducer(producerId);
      client.to(client.roomId).emit("closeProducer", producerId);
      return true;
    } catch {
      return false;
    }
  }

  async consume(
    client: Client,
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    try {
      const consumer = await this.getPeer(client).consume(
        transportId,
        producerId,
        rtpCapabilities,
      );

      return {
        id: consumer.id,
        kind: consumer.kind,
        producerId: consumer.producerId,
        rtpParameters: consumer.rtpParameters,
      };
    } catch {
      return {};
    }
  }

  async resumeConsumer(client: Client, consumerId: string) {
    try {
      await this.getPeer(client).resumeConsumer(consumerId);
      return true;
    } catch {
      return false;
    }
  }

  closeConsumer(client: Client, consumerId: string) {
    try {
      this.getPeer(client).closeConsumer(consumerId);
      return true;
    } catch {
      return false;
    }
  }

  closePeer(client: Client) {
    const peers = this.rooms.get(client.roomId)?.appData.peers;
    peers?.get(client.id)?.close();
    peers?.delete(client.id);
  }
}
