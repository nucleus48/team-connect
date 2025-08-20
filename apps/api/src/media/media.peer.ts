import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";

export class MediaPeer {
  private readonly transports: Map<string, types.WebRtcTransport> = new Map();
  private readonly consumers: Map<string, types.Consumer> = new Map();
  private readonly producers: Map<
    string,
    types.Producer<{ streamId: string; name: string }>
  > = new Map();

  constructor(
    readonly userId: string,
    private readonly room: types.Router,
  ) {}

  private getTransport(transportId: string) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new WsException("Transport not found");
    }

    return transport;
  }

  getRouterRtpCapabilities() {
    return this.room.rtpCapabilities;
  }

  async createWebRtcTransport(announcedIp: string) {
    const transport = await this.room.createWebRtcTransport({
      listenIps: [
        {
          announcedIp,
          ip: "0.0.0.0",
        },
      ],
    });

    this.transports.set(transport.id, transport);

    transport.addListener("routerclose", () => {
      this.transports.delete(transport.id);
    });

    return transport;
  }

  async connectTransport(
    transportId: string,
    dtlsParameters: types.DtlsParameters,
  ) {
    const transport = this.getTransport(transportId);
    await transport.connect({ dtlsParameters });
  }

  async produce(
    transportId: string,
    streamId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const producer = await this.getTransport(transportId).produce({
      kind,
      rtpParameters,
      appData: { streamId, name: "Nucleus Erumagborie" },
    });

    this.producers.set(producer.id, producer);

    producer.addListener("transportclose", () => {
      this.producers.delete(producer.id);
    });

    return producer;
  }

  getProducers() {
    const producers = Array.from(this.producers.values()).map((producer) => ({
      id: producer.id,
      kind: producer.kind,
      streamId: producer.appData.streamId,
      paused: producer.paused,
    }));

    return producers;
  }

  async pauseProducer(producerId: string) {
    if (this.producers.has(producerId)) {
      const producer = this.producers.get(producerId)!;
      await producer.pause();
    }
  }

  async resumeProducer(producerId: string) {
    if (this.producers.has(producerId)) {
      const producer = this.producers.get(producerId)!;
      await producer.resume();
    }
  }

  closeProducer(producerId: string) {
    const producer = this.producers.get(producerId);
    this.producers.delete(producerId);
    producer?.close();
  }

  async consume(
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const consumer = await this.getTransport(transportId).consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    this.consumers.set(consumer.id, consumer);

    consumer.addListener("transportclose", () => {
      this.consumers.delete(consumer.id);
    });

    consumer.addListener("producerclose", () => {
      this.consumers.delete(consumer.id);
    });

    consumer.addListener("producerpause", () => void consumer.pause());
    consumer.addListener("producerresume", () => void consumer.resume());

    return consumer;
  }

  async resumeConsumer(consumerId: string) {
    await this.consumers.get(consumerId)?.resume();
  }

  closeConsumer(consumerId: string) {
    const consumer = this.consumers.get(consumerId);
    this.consumers.delete(consumerId);
    consumer?.close();
  }

  close() {
    this.transports.forEach((transport) => transport.close());
  }
}
