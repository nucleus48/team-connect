import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { IMediaSocket } from "@repo/shared-types";
import { types } from "mediasoup";
import { MediaService } from "./media.service";

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
    @MessageBody("appData") appData: types.AppData,
    @MessageBody("kind") kind: types.MediaKind,
    @MessageBody("rtpParameters") rtpParameters: types.RtpParameters,
  ) {
    return this.mediaService.produce(
      client,
      appData.transportId as string,
      appData.streamId as string,
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
