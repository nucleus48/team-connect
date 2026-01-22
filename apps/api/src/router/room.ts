import { Logger } from "@nestjs/common";
import * as mediasoup from "mediasoup";
import { config } from "../config/mediasoup.config";

export interface ProducerData extends mediasoup.types.AppData {
  enabled?: boolean;
  display?: boolean;
}

export interface Peer {
  peerId: string;
  userId: string;
  presenting: boolean;
  consumers: Map<string, mediasoup.types.Consumer>;
  transports: Map<string, mediasoup.types.WebRtcTransport>;
  producers: Map<string, mediasoup.types.Producer<ProducerData>>;
}

export class Room {
  private logger = new Logger(Room.name);
  private peers = new Map<string, Peer>();

  constructor(
    public id: string,
    public router: mediasoup.types.Router,
  ) {}

  addPeer(peerId: string, userId: string) {
    this.peers.set(peerId, {
      userId,
      peerId: peerId,
      presenting: false,
      producers: new Map(),
      consumers: new Map(),
      transports: new Map(),
    });

    this.logger.log(`Peer ${peerId} joined room ${this.id}`);
  }

  private getPeer(peerId: string) {
    const peer = this.peers.get(peerId);

    if (!peer) {
      throw new Error(`Peer ${peerId} not found in room ${this.id}`);
    }

    return peer;
  }

  get peersLength() {
    return this.peers.size;
  }

  getOtherPeers(peerId: string) {
    const otherPeers: Pick<Peer, "peerId" | "userId" | "presenting">[] = [];

    for (const peer of this.peers.values()) {
      if (peer.peerId !== peerId) {
        otherPeers.push({
          peerId: peer.peerId,
          userId: peer.userId,
          presenting: peer.presenting,
        });
      }
    }

    return otherPeers;
  }

  updatePeerPresenting(peerId: string, presenting: boolean) {
    for (const peer of this.peers.values()) {
      if (peer.peerId === peerId) {
        peer.presenting = presenting;
      } else {
        peer.presenting = false;
      }
    }
  }

  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);

    if (peer) {
      peer.producers.forEach((producer) => {
        producer.close();
      });

      peer.consumers.forEach((consumer) => {
        consumer.close();
      });

      peer.transports.forEach((transport) => {
        transport.close();
      });
    }

    this.peers.delete(peerId);
    this.logger.log(`Peer ${peerId} left room ${this.id}`);
  }

  getRouterRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  async createWebRtcTransport(peerId: string) {
    const peer = this.getPeer(peerId);
    const transport = await this.router.createWebRtcTransport({
      listenIps: config.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    peer.transports.set(transport.id, transport);

    this.logger.log(
      `Created WebRtcTransport for peer ${peerId}: ${transport.id}`,
    );

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
  }

  private getTransport(peerId: string, transportId: string) {
    const peer = this.getPeer(peerId);
    const transport = peer.transports.get(transportId);

    if (!transport) {
      throw new Error(
        `Transport ${transportId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    return transport;
  }

  async connectWebRtcTransport(
    peerId: string,
    transportId: string,
    dtlsParameters: mediasoup.types.DtlsParameters,
  ) {
    const transport = this.getTransport(peerId, transportId);
    await transport.connect({ dtlsParameters });

    this.logger.log(
      `WebRtcTransport ${transportId} connected for peer ${peerId}`,
    );
  }

  async produce(
    peerId: string,
    transportId: string,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters,
    appData: ProducerData,
  ) {
    const peer = this.getPeer(peerId);
    const transport = this.getTransport(peerId, transportId);
    const producer = await transport.produce({ kind, rtpParameters, appData });
    peer.producers.set(producer.id, producer);

    this.logger.log(
      `Producer ${producer.id} created for peer ${peerId} in room ${this.id}`,
    );

    return producer.id;
  }

  private getProducer(peerId: string, producerId: string) {
    const peer = this.getPeer(peerId);
    const producer = peer.producers.get(producerId);

    if (!producer) {
      throw new Error(
        `Producer ${producerId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    return producer;
  }

  getOtherProducers(peerId: string) {
    const otherProducers: {
      peerId: string;
      streamId: string;
      producerId: string;
      appData: ProducerData;
    }[] = [];

    for (const peer of this.peers.values()) {
      if (peer.peerId !== peerId) {
        for (const producer of peer.producers.values()) {
          const streamId = producer.rtpParameters.msid?.split(" ")[0] ?? "";

          otherProducers.push({
            streamId,
            peerId: peer.peerId,
            producerId: producer.id,
            appData: producer.appData,
          });
        }
      }
    }

    return otherProducers;
  }

  updateProducerData(
    peerId: string,
    producerId: string,
    appData: Partial<ProducerData>,
  ) {
    const producer = this.getProducer(peerId, producerId);
    producer.appData = { ...producer.appData, ...appData };
  }

  closeProducer(peerId: string, producerId: string) {
    const peer = this.getPeer(peerId);
    const producer = peer.producers.get(producerId);

    if (producer) {
      producer.close();
      peer.producers.delete(producerId);
      this.logger.log(
        `Producer ${producerId} closed for peer ${peerId} in room ${this.id}`,
      );

      return producer.appData;
    }
  }

  async consume(
    peerId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ) {
    const canConsume = this.router.canConsume({
      producerId,
      rtpCapabilities,
    });

    if (!canConsume) {
      throw new Error(
        `Router cannot consume producer ${producerId} with given RTP capabilities`,
      );
    }

    const peer = this.getPeer(peerId);
    const transport = this.getTransport(peerId, transportId);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    consumer.addListener("producerclose", () => {
      this.closeConsumer(peerId, consumer.id);
    });

    peer.consumers.set(consumer.id, consumer);

    this.logger.log(
      `Consumer ${consumer.id} created for peer ${peerId} consuming producer ${producerId}`,
    );

    return {
      id: consumer.id,
      kind: consumer.kind,
      producerId: consumer.producerId,
      rtpParameters: consumer.rtpParameters,
    };
  }

  private getConsumer(peerId: string, consumerId: string) {
    const peer = this.getPeer(peerId);
    const consumer = peer.consumers.get(consumerId);

    if (!consumer) {
      throw new Error(
        `Consumer ${consumerId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    return consumer;
  }

  async resumeConsumer(peerId: string, consumerId: string) {
    const consumer = this.getConsumer(peerId, consumerId);
    await consumer.resume();
    this.logger.log(
      `Consumer ${consumerId} resumed for peer ${peerId} in room ${this.id}`,
    );
  }

  closeConsumer(peerId: string, consumerId: string) {
    const peer = this.getPeer(peerId);
    const consumer = peer.consumers.get(consumerId);

    if (consumer) {
      consumer.close();
      peer.consumers.delete(consumerId);
      this.logger.log(
        `Consumer ${consumerId} closed for peer ${peerId} in room ${this.id}`,
      );
    }
  }
}
