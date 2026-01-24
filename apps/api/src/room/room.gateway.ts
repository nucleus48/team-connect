import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import {
  RemotePeer,
  RemoteProducer,
  RemoteProducerData,
} from "@repo/types/api/room";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import * as mediasoup from "mediasoup";
import { loadEnvFile } from "process";
import { Socket } from "socket.io";
import { RouterService } from "../router/router.service";
import { WsExceptionFilter } from "../ws-exception.filter";
import { RoomGuard } from "./room.guard";

loadEnvFile();

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: "room",
  cookie: true,
  cors: {
    origin: [process.env.SITE_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
})
@UseGuards(AuthGuard, RoomGuard)
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RoomGateway.name);

  constructor(private routerService: RouterService) {}

  async handleConnection(client: Socket) {
    const { roomId } = client.handshake.query;

    if (typeof roomId === "string") {
      await client.join(roomId);
    }
  }

  async handleDisconnect(client: Socket) {
    const { roomId } = client.handshake.query;

    if (typeof roomId === "string") {
      client.to(roomId).emit("removePeer", { peerId: client.id });
      await this.routerService.removePeerFromRoom(roomId, client.id);
    }
  }

  @SubscribeMessage("getOtherPeers")
  getOtherPeers(@ConnectedSocket() client: Socket) {
    return this.routerService.getOtherPeers(client.roomId, client.id);
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(@ConnectedSocket() client: Socket) {
    const user = client.user;
    const participant = client.participant;

    if (!user) return;

    const newPeer: RemotePeer = {
      name: user.name,
      email: user.email,
      image: user.image,
      peerId: client.id,
      presenting: false,
      role: participant.role,
      userId: participant.userId,
    };

    await this.routerService.addPeerToRoom(client.roomId, newPeer);

    await client.join([
      `joined:${client.roomId}`,
      `${client.participant.role}:${client.roomId}`,
    ]);

    client.to(client.roomId).emit("newPeer", newPeer);

    this.logger.log(`Client ${client.id} joined room ${client.roomId}`);

    const otherProducers = await this.routerService.getOtherProducers(
      client.roomId,
      client.id,
    );

    return otherProducers;
  }

  @SubscribeMessage("updateRoomPresenter")
  async updateRoomPresenter(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      peerId: string;
      presenting: boolean;
    },
  ) {
    await this.routerService.updateRoomPresenter(
      client.roomId,
      data.peerId,
      data.presenting,
    );

    client
      .to(`joined:${client.roomId}`)
      .emit("presenter", { peerId: client.id });

    return { message: "presenter updated" };
  }

  @SubscribeMessage("getRouterRtpCapabilities")
  getRouterRtpCapabilities(@ConnectedSocket() client: Socket) {
    return this.routerService.getRouterRtpCapabilities(client.roomId);
  }

  @SubscribeMessage("createWebRtcTransport")
  createWebRtcTransport(@ConnectedSocket() client: Socket) {
    return this.routerService.createWebRtcTransport(client.roomId, client.id);
  }

  @SubscribeMessage("connectWebRtcTransport")
  async connectWebRtcTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      transportId: string;
      dtlsParameters: mediasoup.types.DtlsParameters;
    },
  ) {
    const { transportId, dtlsParameters } = data;
    await this.routerService.connectWebRtcTransport(
      client.roomId,
      client.id,
      transportId,
      dtlsParameters,
    );
    return { message: "transport connected" };
  }

  @SubscribeMessage("produce")
  async produce(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      transportId: string;
      kind: mediasoup.types.MediaKind;
      rtpParameters: mediasoup.types.RtpParameters;
      appData: RemoteProducerData;
    },
  ) {
    const { transportId, kind, rtpParameters, appData } = data;
    const streamId = rtpParameters.msid?.split(" ")[0] ?? "";
    const producer = await this.routerService.produce(
      client.roomId,
      client.id,
      transportId,
      kind,
      rtpParameters,
      appData,
    );

    const newProducer: RemoteProducer = {
      appData,
      streamId,
      peerId: client.id,
      kind: producer.kind,
      producerId: producer.id,
    };

    client.to(`joined:${client.roomId}`).emit("newProducer", newProducer);

    if (appData.display) {
      await this.routerService.updateRoomPresenter(
        client.roomId,
        client.id,
        true,
      );

      client
        .to(`joined:${client.roomId}`)
        .emit("presenter", { peerId: client.id });
    }

    return { id: producer.id };
  }

  @SubscribeMessage("updateProducerData")
  async updateProducerData(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      producerId: string;
      appData: Partial<RemoteProducerData>;
    },
  ) {
    await this.routerService.updateProducerData(
      client.roomId,
      client.id,
      data.producerId,
      data.appData,
    );

    client.to(`joined:${client.roomId}`).emit("updateProducerData", {
      producerId: data.producerId,
      appData: data.appData,
    });

    return { message: "producer data updated" };
  }

  @SubscribeMessage("closeProducer")
  async closeProducer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      producerId: string;
    },
  ) {
    const appData = await this.routerService.closeProducer(
      client.roomId,
      client.id,
      data.producerId,
    );

    client.to(`joined:${client.roomId}`).emit("removeProducer", {
      producerId: data.producerId,
    });

    if (appData?.display) {
      client.to(`joined:${client.roomId}`).emit("stopPresenting");
    }

    return { message: "producer closed" };
  }

  @SubscribeMessage("consume")
  async consume(
    @MessageBody()
    data: {
      transportId: string;
      producerId: string;
      rtpCapabilities: mediasoup.types.RtpCapabilities;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { transportId, producerId, rtpCapabilities } = data;
    return await this.routerService.consume(
      client.roomId,
      client.id,
      transportId,
      producerId,
      rtpCapabilities,
    );
  }

  @SubscribeMessage("resumeConsumer")
  async resumeConsumer(
    @MessageBody()
    data: {
      consumerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { consumerId } = data;
    await this.routerService.resumeConsumer(
      client.roomId,
      client.id,
      consumerId,
    );
    return { message: "consumer resumed" };
  }

  @SubscribeMessage("closeConsumer")
  async closeConsumer(
    @MessageBody()
    data: {
      consumerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { consumerId } = data;
    await this.routerService.closeConsumer(
      client.roomId,
      client.id,
      consumerId,
    );
    return { message: "consumer closed" };
  }
}
