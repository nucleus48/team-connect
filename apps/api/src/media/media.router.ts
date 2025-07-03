import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";

export class MediaRouter {
  readonly rtpCapabilities: types.RtpCapabilities;
  private readonly producers: Map<string, types.Producer> = new Map();
  private readonly transports: Map<string, types.WebRtcTransport> = new Map();

  constructor(private readonly router: types.Router) {
    this.rtpCapabilities = router.rtpCapabilities;
  }

  static async createRouter(worker: types.Worker) {
    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    });

    return new MediaRouter(router);
  }

  close() {
    this.router.close();
  }

  get transportLength() {
    return this.transports.size;
  }

  private getTransport(transportId: string) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new WsException("Transport not found");
    }

    return transport;
  }

  async createWebRtcTransport(transportId: string) {
    let transport = this.transports.get(transportId);

    if (!transport) {
      transport = await this.router.createWebRtcTransport(
        {} as types.WebRtcTransportOptions,
      );
      this.transports.set(transportId, transport);
    }

    transport.addListener("routerclose", () => {
      this.closeTransport(transportId);
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

  closeTransport(transportId: string) {
    const transport = this.getTransport(transportId);
    transport.close();
    this.transports.delete(transportId);
  }

  async createProducer(
    transportId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const transport = this.getTransport(transportId);
    const producer = await transport.produce({
      kind: kind,
      rtpParameters: rtpParameters,
    });

    producer.addListener("transportclose", () => {
      producer.close();
      this.producers.delete(producer.id);
    });

    this.producers.set(producer.id, producer);
    return producer;
  }

  async createConsumer(
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const transport = this.getTransport(transportId);
    const consumer = await transport.consume({
      producerId: producerId,
      rtpCapabilities: rtpCapabilities,
    });

    consumer.addListener("transportclose", () => {
      consumer.close();
    });

    return consumer;
  }
}
