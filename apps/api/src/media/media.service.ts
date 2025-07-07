import { Injectable } from "@nestjs/common";
import { types } from "mediasoup";
import { IMediaSocket } from "./media.interface";
import { MediaConsumers } from "./providers/media.consumers";
import { MediaProducers } from "./providers/media.producers";
import { MediaRouters } from "./providers/media.routers";
import { MediaStreams } from "./providers/media.streams";
import { MediaTransports } from "./providers/media.transports";

@Injectable()
export class MediaService {
  private readonly clientTransports: Map<string, Set<string>> = new Map();

  constructor(
    private readonly mediaRouters: MediaRouters,
    private readonly mediaTransports: MediaTransports,
    private readonly mediaStreams: MediaStreams,
    private readonly mediaProducers: MediaProducers,
    private readonly mediaConsumers: MediaConsumers,
  ) {}

  async handleConnection(client: IMediaSocket) {
    client.routerId = client.handshake.query.routerId as string;

    await client.join(client.routerId);
    this.clientTransports.set(client.id, new Set());

    const mediaStreams = this.mediaStreams.getStreams(client.routerId);
    client.emit("join", mediaStreams);
  }

  handleDisconnect(client: IMediaSocket) {
    const transports = this.clientTransports.get(client.id);
    this.clientTransports.delete(client.id);

    transports?.forEach((transportId) => {
      this.mediaTransports.close(transportId);
      this.mediaStreams.closeStreams(client, transportId);
    });
  }

  getRouterRtpCapabilities(client: IMediaSocket) {
    return this.mediaRouters.getRouterRtpCapabilities(client.routerId);
  }

  async createWebRtcTransport(client: IMediaSocket) {
    const transport = await this.mediaTransports.createWebRtcTransport(
      client.routerId,
    );

    this.clientTransports.get(client.id)?.add(transport.id);

    return {
      id: transport.id,
      dtlsParameters: transport.dtlsParameters,
      iceCandidates: transport.iceCandidates,
      iceParameters: transport.iceParameters,
      sctpParameters: transport.sctpParameters,
    };
  }

  async connectTransport(
    transportId: string,
    dtlsParameters: types.DtlsParameters,
  ) {
    await this.mediaTransports.connectTransport(transportId, dtlsParameters);
    return "connected";
  }

  async produce(
    client: IMediaSocket,
    transportId: string,
    streamId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const producer = await this.mediaProducers.produce(
      transportId,
      kind,
      rtpParameters,
    );

    client.to(client.routerId).emit("newProducer", {
      streamId,
      id: producer.id,
    });

    producer.on("transportclose", () => {
      this.closeStream(client, streamId);
    });

    const stream =
      this.mediaStreams.get(streamId) ??
      this.mediaStreams.create(client, streamId, transportId);

    stream.producers.push(producer.id);

    return { id: producer.id };
  }

  closeProducer(client: IMediaSocket, streamId: string, producerId: string) {
    this.mediaStreams.closeProducer(client, streamId, producerId);
    return "closed";
  }

  closeStream(client: IMediaSocket, streamId: string) {
    this.mediaStreams.close(client, streamId);
    return "closed";
  }

  async consume(
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const consumer = await this.mediaConsumers.consume(
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
  }
}
