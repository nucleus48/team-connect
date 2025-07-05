import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { types } from "mediasoup";
import { MediaService } from "./media.service";
import { MediaSocket } from "./media.types";

@WebSocketGateway({ cors: true })
export class MediaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly mediaService: MediaService) {}

  handleConnection(client: MediaSocket) {
    return this.mediaService.handleConnection(client);
  }

  handleDisconnect(client: MediaSocket) {
    return this.mediaService.handleDisconnection(client);
  }

  @SubscribeMessage("getRouterRtpCapabilities")
  handleGetRouterRtpCapabilities(@ConnectedSocket() client: MediaSocket) {
    return this.mediaService.getRouterRtpCapabilities(client);
  }

  @SubscribeMessage("createWebRtcTransport")
  handleCreateWebRtcTransport(@ConnectedSocket() client: MediaSocket) {
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
    @ConnectedSocket() client: MediaSocket,
    @MessageBody("appData") appData: types.AppData,
    @MessageBody("kind") kind: types.MediaKind,
    @MessageBody("rtpParameters") rtpParameters: types.RtpParameters,
  ) {
    return this.mediaService.createProducer(
      client,
      appData.streamId as string,
      appData.transportId as string,
      kind,
      rtpParameters,
    );
  }

  @SubscribeMessage("createConsumer")
  handleCreateConsumer(
    @MessageBody("transportId") transportId: string,
    @MessageBody("producerId") producerId: string,
    @MessageBody("rtpCapabilities") rtpCapabilities: types.RtpCapabilities,
  ) {
    return this.mediaService.createConsumer(
      transportId,
      producerId,
      rtpCapabilities,
    );
  }
}
