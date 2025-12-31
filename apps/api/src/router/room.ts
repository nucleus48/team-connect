import { Logger } from "@nestjs/common";
import { types } from "mediasoup";
import { config } from "../config/mediasoup.config";

interface Peer {
  id: string;
  name: string;
  transports: Map<string, types.WebRtcTransport>;
  producers: Map<string, types.Producer>;
  consumers: Map<string, types.Consumer>;
}

export class Room {
  private readonly logger = new Logger(Room.name);

  public id: string;
  public router: types.Router;
  private peers = new Map<string, Peer>();

  constructor(roomId: string, router: types.Router) {
    this.id = roomId;
    this.router = router;
  }

  addPeer(peerId: string, name: string) {
    this.peers.set(peerId, {
      id: peerId,
      name,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    });

    this.logger.log(`Peer ${name} (${peerId}) joined room ${this.id}`);
  }

  getPeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found in room ${this.id}`);
    }
    return peer;
  }

  removePeer(peerId: string) {
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

  async connectWebRtcTransport(
    peerId: string,
    transportId: string,
    dtlsParameters: types.DtlsParameters,
  ) {
    const peer = this.getPeer(peerId);
    const transport = peer.transports.get(transportId);

    if (!transport) {
      throw new Error(
        `Transport ${transportId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    await transport.connect({ dtlsParameters });

    this.logger.log(
      `WebRtcTransport ${transportId} connected for peer ${peerId}`,
    );
  }

  async produce(
    peerId: string,
    transportId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const peer = this.getPeer(peerId);
    const transport = peer.transports.get(transportId);

    if (!transport) {
      throw new Error(
        `Transport ${transportId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    const producer = await transport.produce({ kind, rtpParameters });
    peer.producers.set(producer.id, producer);

    this.logger.log(
      `Producer ${producer.id} created for peer ${peerId} in room ${this.id}`,
    );

    return producer.id;
  }

  async consume(
    peerId: string,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const peer = this.getPeer(peerId);
    const consumerTransport = peer.transports.get(consumerTransportId);

    if (!consumerTransport) {
      throw new Error(
        `Consumer transport ${consumerTransportId} not found for peer ${peerId} in room ${this.id}`,
      );
    }

    const canConsume = this.router.canConsume({
      producerId,
      rtpCapabilities,
    });

    if (!canConsume) {
      throw new Error(
        `Router cannot consume producer ${producerId} with given RTP capabilities`,
      );
    }

    const consumer = await consumerTransport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    peer.consumers.set(consumer.id, consumer);

    this.logger.log(
      `Consumer ${consumer.id} created for peer ${peerId} consuming producer ${producerId}`,
    );

    return {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
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
    }
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

  getProducerListForPeer(peerId: string) {
    const peer = this.getPeer(peerId);
    return Array.from(peer.producers.keys());
  }

  getOtherProducers(peerId: string) {
    const otherProducers: { peerId: string; producerId: string }[] = [];
    for (const [id, peer] of this.peers.entries()) {
      if (id !== peerId) {
        for (const producerId of peer.producers.keys()) {
          otherProducers.push({ peerId: id, producerId });
        }
      }
    }
    return otherProducers;
  }
}
