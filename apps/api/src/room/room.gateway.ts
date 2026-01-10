import { Logger, UseFilters, UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
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
export class RoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RoomGateway.name);

  constructor(private routerService: RouterService) {}

  afterInit() {
    this.logger.log("RoomGateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // TODO: Handle peer removal from rooms and close producers/consumers
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(@ConnectedSocket() client: Socket) {
    await this.routerService.addPeerToRoom(client.roomId, client.id);
    await client.join(client.roomId);
    this.logger.log(`Client ${client.id} joined room ${client.roomId}`);

    const otherProducers = await this.routerService.getOtherProducers(
      client.roomId,
      client.id,
    );

    // Notify the joining peer about existing producers
    if (otherProducers.length > 0) {
      client.emit("newProducers", otherProducers);
    }

    return true;
  }

  @SubscribeMessage("getRouterRtpCapabilities")
  getRouterRtpCapabilities(@ConnectedSocket() client: Socket) {
    return this.routerService.getRouterRtpCapabilities(client.roomId);
  }

  @SubscribeMessage("createWebRtcTransport")
  async createWebRtcTransport(@ConnectedSocket() client: Socket) {
    return await this.routerService.createWebRtcTransport(
      client.roomId,
      client.id,
    );
  }

  @SubscribeMessage("connectWebRtcTransport")
  async connectWebRtcTransport(
    @MessageBody()
    data: {
      transportId: string;
      dtlsParameters: mediasoup.types.DtlsParameters;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { transportId, dtlsParameters } = data;
    await this.routerService.connectWebRtcTransport(
      client.roomId,
      client.id,
      transportId,
      dtlsParameters,
    );
  }

  @SubscribeMessage("produce")
  async produce(
    @MessageBody()
    data: {
      transportId: string;
      kind: mediasoup.types.MediaKind;
      rtpParameters: mediasoup.types.RtpParameters;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { transportId, kind, rtpParameters } = data;
    const producerId = await this.routerService.produce(
      client.roomId,
      client.id,
      transportId,
      kind,
      rtpParameters,
    );

    // Notify other peers in the room about the new producer
    client
      .to(client.roomId)
      .emit("newProducer", { peerId: client.id, producerId });

    return producerId;
  }

  @SubscribeMessage("pauseProducer")
  async pauseProducer(
    @MessageBody()
    data: {
      producerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { producerId } = data;
    await this.routerService.pauseProducer(
      client.roomId,
      client.id,
      producerId,
    );
  }

  @SubscribeMessage("resumeProducer")
  async resumeProducer(
    @MessageBody()
    data: {
      producerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { producerId } = data;
    await this.routerService.resumeProducer(
      client.roomId,
      client.id,
      producerId,
    );
  }

  @SubscribeMessage("consume")
  async consume(
    @MessageBody()
    data: {
      consumerTransportId: string;
      producerId: string;
      rtpCapabilities: mediasoup.types.RtpCapabilities;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { consumerTransportId, producerId, rtpCapabilities } = data;
    return await this.routerService.consume(
      client.roomId,
      client.id,
      consumerTransportId,
      producerId,
      rtpCapabilities,
    );
  }

  @SubscribeMessage("pauseConsumer")
  async pauseConsumer(
    @MessageBody()
    data: {
      consumerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { consumerId } = data;
    await this.routerService.pauseConsumer(
      client.roomId,
      client.id,
      consumerId,
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
  }
}
