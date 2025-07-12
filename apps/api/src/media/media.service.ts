import { Injectable } from "@nestjs/common";
import { types } from "mediasoup";
import { IMediaSocket } from "./media.types";
import { MediaConsumers } from "./providers/media.consumers";
import { MediaProducers } from "./providers/media.producers";
import { MediaRouters } from "./providers/media.routers";
import { MediaTransports } from "./providers/media.transports";

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRouters: MediaRouters,
    private readonly mediaTransports: MediaTransports,
    private readonly mediaProducers: MediaProducers,
    private readonly mediaConsumers: MediaConsumers,
  ) {}

  async handleConnection(client: IMediaSocket) {
    client.routerId = client.handshake.query.routerId as string;
    const producers = this.mediaProducers.getByRouterId(client.routerId);

    await client.join(client.routerId);
    client.emit("producers", producers);
  }

  handleDisconnect(client: IMediaSocket) {
    this.mediaTransports.closeByClientId(client.id);
  }

  async createRouter(owner: string) {
    const router = await this.mediaRouters.createRouter(owner);
    return router.id;
  }

  getRouterRtpCapabilities(client: IMediaSocket) {
    return this.mediaRouters.getRouterRtpCapabilities(client.routerId);
  }

  async createWebRtcTransport(client: IMediaSocket) {
    const transport = await this.mediaTransports.createWebRtcTransport(
      client.routerId,
      client.id,
    );

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
      client.routerId,
      transportId,
      streamId,
      kind,
      rtpParameters,
    );

    producer.on("transportclose", () => {
      this.closeProducer(client, producer.id);
    });

    client.to(client.routerId).emit("newProducer", {
      streamId,
      id: producer.id,
      kind: producer.kind,
      paused: true,
    });

    return { id: producer.id };
  }

  async pauseProducer(client: IMediaSocket, producerId: string) {
    await this.mediaProducers.pause(producerId);
    client.to(client.routerId).emit("pauseProducer", producerId);
    return "paused";
  }

  async resumeProducer(client: IMediaSocket, producerId: string) {
    await this.mediaProducers.resume(producerId);
    client.to(client.routerId).emit("resumeProducer", producerId);
    return "resumed";
  }

  closeProducer(client: IMediaSocket, producerId: string) {
    this.mediaProducers.close(producerId);
    client.to(client.routerId).emit("closeProducer", producerId);
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

  async pauseConsumer(consumerId: string) {
    await this.mediaConsumers.pause(consumerId);
    return "paused";
  }

  async resumeConsumer(consumerId: string) {
    await this.mediaConsumers.resume(consumerId);
    return "resumed";
  }

  closeConsumer(consumerId: string) {
    this.mediaConsumers.close(consumerId);
    return "closed";
  }
}
