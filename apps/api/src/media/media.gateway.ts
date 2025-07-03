import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { Socket } from "socket.io";
import {
  ConnectTransportDto,
  CreateConsumerDto,
  CreateProducerDto,
} from "./media.dto";
import { MediaService } from "./media.service";

@WebSocketGateway()
export class MediaGateway {
  constructor(private readonly mediaService: MediaService) {}

  @SubscribeMessage("capabilities")
  getRouterRtpCapabilities(
    @MessageBody("routerId") routerId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.data = routerId;
    return this.mediaService.getRouterRtpCapabilities(routerId);
  }

  @SubscribeMessage("transport")
  createWebRtcTransport(
    @MessageBody("routerId") routerId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.mediaService.createWebRtcTransport(routerId, socket);
  }

  @SubscribeMessage("connect")
  connectTransport(@MessageBody() data: ConnectTransportDto) {
    return this.mediaService.connectTransport(data);
  }

  @SubscribeMessage("produce")
  createProducer(@MessageBody() data: CreateProducerDto) {
    return this.mediaService.createProducer(data);
  }

  @SubscribeMessage("consume")
  createConsumer(@MessageBody() data: CreateConsumerDto) {
    return this.mediaService.createConsumer(data);
  }

  @SubscribeMessage("disconnect")
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.mediaService.closeTransport(socket.data as string, socket.id);
  }
}
