import { Logger, UseFilters } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import * as mediasoup from "mediasoup";
import { Server, Socket } from "socket.io";
import { RouterService } from "../router/router.service";
import { WsExceptionFilter } from "../ws-exception.filter";

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ namespace: "room", cors: { origin: "*" } })
export class RoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

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

  @SubscribeMessage("createRoom")
  async createRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    await this.routerService.createRoom(roomId);
    this.logger.log(`Room ${roomId} created by ${client.id}`);
    return roomId;
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(
    @MessageBody() data: { roomId: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, name } = data;
    this.routerService.addPeerToRoom(roomId, client.id, name);
    await client.join(roomId);
    this.logger.log(`Client ${client.id} (${name}) joined room ${roomId}`);

    const otherProducers = this.routerService.getOtherProducers(
      roomId,
      client.id,
    );

    // Notify the joining peer about existing producers
    if (otherProducers.length > 0) {
      client.emit("newProducers", otherProducers);
    }
  }

  @SubscribeMessage("getRouterRtpCapabilities")
  getRouterRtpCapabilities(@MessageBody() data: { roomId: string }) {
    const { roomId } = data;
    return this.routerService.getRouterRtpCapabilities(roomId);
  }

  @SubscribeMessage("createWebRtcTransport")
  async createWebRtcTransport(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    return await this.routerService.createWebRtcTransport(roomId, client.id);
  }

  @SubscribeMessage("connectWebRtcTransport")
  async connectWebRtcTransport(
    @MessageBody()
    data: {
      roomId: string;
      transportId: string;
      dtlsParameters: mediasoup.types.DtlsParameters;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, transportId, dtlsParameters } = data;
    await this.routerService.connectWebRtcTransport(
      roomId,
      client.id,
      transportId,
      dtlsParameters,
    );
  }

  @SubscribeMessage("produce")
  async produce(
    @MessageBody()
    data: {
      roomId: string;
      transportId: string;
      kind: mediasoup.types.MediaKind;
      rtpParameters: mediasoup.types.RtpParameters;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, transportId, kind, rtpParameters } = data;
    const producerId = await this.routerService.produce(
      roomId,
      client.id,
      transportId,
      kind,
      rtpParameters,
    );

    // Notify other peers in the room about the new producer
    client.to(roomId).emit("newProducer", { peerId: client.id, producerId });

    return producerId;
  }

  @SubscribeMessage("consume")
  async consume(
    @MessageBody()
    data: {
      roomId: string;
      consumerTransportId: string;
      producerId: string;
      rtpCapabilities: mediasoup.types.RtpCapabilities;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, consumerTransportId, producerId, rtpCapabilities } = data;
    return await this.routerService.consume(
      roomId,
      client.id,
      consumerTransportId,
      producerId,
      rtpCapabilities,
    );
  }

  @SubscribeMessage("disconnect")
  async disconnect(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    // TODO: Implement proper disconnection logic to remove peer from room and close all associated mediasoup resources
    this.logger.log(
      `Client ${client.id} explicitly disconnected from room ${roomId}`,
    );
    await client.leave(roomId);
  }
}
