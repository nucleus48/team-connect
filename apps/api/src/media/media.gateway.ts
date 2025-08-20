import { AuthGuard } from "@/auth/auth.guard";
import { RoomRoles } from "@/rooms/rooms.decorator";
import { RoomRolesGuard } from "@/rooms/rooms.guard";
import { RoomRole } from "@/rooms/rooms.role";
import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { types } from "mediasoup";
import { Socket } from "socket.io";
import { MediaService } from "./media.service";

@UseGuards(AuthGuard)
@RoomRoles(RoomRole.Member)
@WebSocketGateway({ cors: true })
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly mediaService: MediaService) {}

  handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId as unknown;

    if (typeof roomId === "string") {
      client.roomId = roomId;
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.mediaService.closePeer(client);
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(@ConnectedSocket() client: Socket) {
    return this.mediaService.joinRoom(client);
  }

  @SubscribeMessage("inRoom")
  handleInRoom(@ConnectedSocket() client: Socket) {
    return this.mediaService.inRoom(client);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("getRouterRtpCapabilities")
  handleGetRouterRtpCapabilities(@ConnectedSocket() client: Socket) {
    return this.mediaService.getRouterRtpCapabilities(client);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("createWebRtcTransport")
  handleCreateWebRtcTransport(@ConnectedSocket() client: Socket) {
    return this.mediaService.createWebRtcTransport(client);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("connectTransport")
  handleConnectTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody("transportId") transportId: string,
    @MessageBody("dtlsParameters") dtlsParameters: types.DtlsParameters,
  ) {
    return this.mediaService.connectTransport(
      client,
      transportId,
      dtlsParameters,
    );
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("createProducer")
  handleCreateProducer(
    @ConnectedSocket() client: Socket,
    @MessageBody("kind") kind: types.MediaKind,
    @MessageBody("rtpParameters") rtpParameters: types.RtpParameters,
    @MessageBody("appData")
    appData: { transportId: string; streamId: string },
  ) {
    return this.mediaService.produce(
      client,
      appData.transportId,
      appData.streamId,
      kind,
      rtpParameters,
    );
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("getProducers")
  handleGetProducers(@ConnectedSocket() client: Socket) {
    return this.mediaService.getProducers(client);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("pauseProducer")
  handlePauseProducer(
    @ConnectedSocket() client: Socket,
    @MessageBody("producerId") producerId: string,
  ) {
    return this.mediaService.pauseProducer(client, producerId);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("resumeProducer")
  handleResumeProducer(
    @ConnectedSocket() client: Socket,
    @MessageBody("producerId") producerId: string,
  ) {
    return this.mediaService.resumeProducer(client, producerId);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("closeProducer")
  handleCloseProducer(
    @ConnectedSocket() client: Socket,
    @MessageBody("producerId") producerId: string,
  ) {
    return this.mediaService.closeProducer(client, producerId);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("createConsumer")
  handleCreateConsumer(
    @ConnectedSocket() client: Socket,
    @MessageBody("transportId") transportId: string,
    @MessageBody("producerId") producerId: string,
    @MessageBody("rtpCapabilities") rtpCapabilities: types.RtpCapabilities,
  ) {
    return this.mediaService.consume(
      client,
      transportId,
      producerId,
      rtpCapabilities,
    );
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("resumeConsumer")
  handleResumeConsumer(
    @ConnectedSocket() client: Socket,
    @MessageBody("consumerId") consumerId: string,
  ) {
    return this.mediaService.resumeConsumer(client, consumerId);
  }

  @UseGuards(RoomRolesGuard)
  @SubscribeMessage("closeConsumer")
  handleCloseConsumer(
    @ConnectedSocket() client: Socket,
    @MessageBody("consumerId") consumerId: string,
  ) {
    return this.mediaService.closeConsumer(client, consumerId);
  }
}
