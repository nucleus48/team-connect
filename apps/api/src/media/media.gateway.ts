import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { types } from "mediasoup";
import { IMediaSocket } from "./media.interface";
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

  @SubscribeMessage("closeProducer")
  handleCloseProducer(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody("streamId") streamId: string,
    @MessageBody("producerId") producerId: string,
  ) {
    return this.mediaService.closeProducer(client, streamId, producerId);
  }

  @SubscribeMessage("closeStream")
  handleCloseStream(
    @ConnectedSocket() client: IMediaSocket,
    @MessageBody() streamId: string,
  ) {
    return this.mediaService.closeStream(client, streamId);
  }

  @SubscribeMessage("createConsumer")
  handleCreateConsumer(
    @MessageBody("transportId") transportId: string,
    @MessageBody("producerId") producerId: string,
    @MessageBody("rtpCapabilities") rtpCapabilities: types.RtpCapabilities,
  ) {
    return this.mediaService.consume(transportId, producerId, rtpCapabilities);
  }
}
