import { WorkersService } from "@/workers/workers.service";
import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { MediaSocket, MediaStream } from "./media.types";

@Injectable()
export class MediaService {
  private readonly routers: Map<string, types.Router> = new Map();
  private readonly transports: Map<string, types.WebRtcTransport> = new Map();
  private readonly mediaStreams: Map<string, MediaStream> = new Map();
  private readonly clients: Map<string, Set<string>> = new Map();

  constructor(private readonly workersService: WorkersService) {}

  private async createRouter(routerId: string) {
    const worker = this.workersService.getWorker();

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

    this.routers.set(routerId, router);

    const handleClose = () => {
      this.routers.delete(router.id);
      router.close();
    };

    router.once("workerclose", handleClose);

    setTimeout(handleClose, 24 * 60 * 60 * 1000);

    return router;
  }

  private getTransport(transportId: string) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new WsException("Transport not found");
    }

    return transport;
  }

  private getStream(client: MediaSocket, streamId: string) {
    let stream = this.mediaStreams.get(streamId);

    if (!stream) {
      stream = {
        streamId,
        producers: [],
        routerId: client.routerId,
      };

      this.mediaStreams.set(streamId, stream);

      client.to(client.routerId).emit("newStream", stream);
    }

    return stream;
  }

  async handleConnection(client: MediaSocket) {
    client.routerId = client.handshake.query.routerId as string;

    await client.join(client.routerId);
    this.clients.set(client.id, new Set());

    const mediaStreams = [...this.mediaStreams.values()].filter(
      (stream) => stream.routerId == client.routerId,
    );

    client.emit("join", mediaStreams);
  }

  handleDisconnection(client: MediaSocket) {
    this.clients.get(client.id)?.forEach((transportId) => {
      this.transports.get(transportId)?.close();
      this.transports.delete(transportId);
    });
  }

  async getRouterRtpCapabilities(client: MediaSocket) {
    let router = this.routers.get(client.routerId);

    if (!router) {
      router = await this.createRouter(client.routerId);
    }

    return router.rtpCapabilities;
  }

  async createWebRtcTransport(client: MediaSocket) {
    const router = this.routers.get(client.routerId);

    if (!router) {
      throw new WsException("Router not found");
    }

    const transport = await router.createWebRtcTransport({
      listenIps: ["0.0.0.0"],
    });

    this.transports.set(transport.id, transport);
    this.clients.get(client.id)?.add(transport.id);

    transport.once("routerclose", () => {
      this.transports.delete(transport.id);
      this.clients.get(client.id)?.delete(transport.id);
      transport.close();
    });

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
    const transport = this.getTransport(transportId);
    await transport.connect({ dtlsParameters });
    return "connected";
  }

  async createProducer(
    client: MediaSocket,
    streamId: string,
    transportId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const transport = this.getTransport(transportId);
    const producer = await transport.produce({ kind, rtpParameters });
    const stream = this.getStream(client, streamId);

    stream.producers.push(producer.id);

    client.to(client.routerId).emit("newProducer", {
      streamId: stream.streamId,
      producerId: producer.id,
    });

    producer.once("transportclose", () => {
      producer.close();

      stream.producers = stream.producers.filter(
        (producerId) => producerId !== producer.id,
      );

      if (!stream.producers.length) {
        client.to(client.routerId).emit("removeStream", stream);
        this.mediaStreams.delete(stream.streamId);
      }
    });

    return { id: producer.id };
  }

  async createConsumer(
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const transport = this.getTransport(transportId);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
    });

    const handleClose = () => {
      consumer.close();
    };

    consumer.once("producerclose", handleClose);
    consumer.once("transportclose", handleClose);

    return {
      id: consumer.id,
      kind: consumer.kind,
      producerId: consumer.producerId,
      rtpParameters: consumer.rtpParameters,
    };
  }
}
