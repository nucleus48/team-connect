import { UseFilters } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { types } from "mediasoup";
import { WsExceptionFilter } from "./media.filters";
import { MediaService } from "./media.service";
import { IMediaSocket } from "./media.types";

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ cors: true })
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly mediaService: MediaService) {}

  handleConnection(client: IMediaSocket) {
    return this.mediaService.handleConnection(client);
  }

  handleDisconnect(client: IMediaSocket) {
    return this.mediaService.handleDisconnect(client);
  }

  @SubscribeMessage("getRouterRtpCapabilities")
  handleGetRouterRtpCapabilities(@ConnectedSocket() client: IMediaSocket) {
    return this.mediaService.getRouterRtpCapabilities(client);
  }

  @SubscribeMessage("createWebRtcTransport")
  handleCreateWebRtcTransport(@ConnectedSocket() client: IMediaSocket) {
    return this.mediaService.createWebRtcTransport(client);
  }

  @SubscribeMessage("connectTransport")
  handleConnectTransport(
    @MessageBody("transportId") transportId: string,
    @MessageBody("dtlsParameters") dtlsParameters: types.DtlsParameters,
  ) {
    return this.mediaService.connectTransport(transportId, dtlsParameters);
  }

  @SubscribeMessage("createProducer")
  handleCreateProducer(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody("kind") kind: types.MediaKind,
    @MessageBody("rtpParameters") rtpParameters: types.RtpParameters,
    @MessageBody("appData")
    { transportId, streamId }: { transportId: string; streamId: string },
  ) {
    return this.mediaService.produce(
      client,
      transportId,
      streamId,
      kind,
      rtpParameters,
    );
  }

  @SubscribeMessage("pauseProducer")
  handlePauseProducer(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody() producerId: string,
  ) {
    return this.mediaService.pauseProducer(client, producerId);
  }

  @SubscribeMessage("resumeProducer")
  handleResumeProducer(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody() producerId: string,
  ) {
    return this.mediaService.resumeProducer(client, producerId);
  }

  @SubscribeMessage("closeProducer")
  handleCloseProducer(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody() producerId: string,
  ) {
    return this.mediaService.closeProducer(client, producerId);
  }

  @SubscribeMessage("createConsumer")
  handleCreateConsumer(
    @MessageBody("transportId") transportId: string,
    @MessageBody("producerId") producerId: string,
    @MessageBody("rtpCapabilities") rtpCapabilities: types.RtpCapabilities,
  ) {
    return this.mediaService.consume(transportId, producerId, rtpCapabilities);
  }

  @SubscribeMessage("pauseConsumer")
  handlePauseConsumer(@MessageBody() consumerId: string) {
    return this.mediaService.pauseConsumer(consumerId);
  }

  @SubscribeMessage("resumeConsumer")
  handleResumeConsumer(@MessageBody() consumerId: string) {
    return this.mediaService.resumeConsumer(consumerId);
  }

  @SubscribeMessage("closeConsumer")
  handleCloseConsumer(@MessageBody() consumerId: string) {
    return this.mediaService.closeConsumer(consumerId);
  }
}
