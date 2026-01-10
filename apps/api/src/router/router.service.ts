import { Injectable } from "@nestjs/common";
import * as mediasoup from "mediasoup";
import { config } from "../config/mediasoup.config";
import { Room } from "./room";
import { RouterWorker } from "./router.worker";

@Injectable()
export class RouterService {
  private rooms = new Map<string, Room>();

  constructor(private routerWorker: RouterWorker) {}

  private async createRoom(roomId: string) {
    const worker = this.routerWorker.worker;
    const router = await worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });
    const room = new Room(roomId, router);
    this.rooms.set(roomId, room);
    return room;
  }

  async getRoom(roomId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      const room = await this.createRoom(roomId);
      return room;
    }

    return room;
  }

  async addPeerToRoom(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    room.addPeer(peerId);
  }

  async getRouterRtpCapabilities(roomId: string) {
    const room = await this.getRoom(roomId);
    return room.getRouterRtpCapabilities();
  }

  async createWebRtcTransport(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    return await room.createWebRtcTransport(peerId);
  }

  async connectWebRtcTransport(
    roomId: string,
    peerId: string,
    transportId: string,
    dtlsParameters: mediasoup.types.DtlsParameters,
  ) {
    const room = await this.getRoom(roomId);
    await room.connectWebRtcTransport(peerId, transportId, dtlsParameters);
  }

  async produce(
    roomId: string,
    peerId: string,
    transportId: string,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters,
  ) {
    const room = await this.getRoom(roomId);
    return await room.produce(peerId, transportId, kind, rtpParameters);
  }

  async pauseProducer(roomId: string, peerId: string, producerId: string) {
    const room = await this.getRoom(roomId);
    await room.pauseProducer(peerId, producerId);
  }

  async resumeProducer(roomId: string, peerId: string, producerId: string) {
    const room = await this.getRoom(roomId);
    await room.resumeProducer(peerId, producerId);
  }

  async consume(
    roomId: string,
    peerId: string,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ) {
    const room = await this.getRoom(roomId);
    return await room.consume(
      peerId,
      consumerTransportId,
      producerId,
      rtpCapabilities,
    );
  }

  async pauseConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = await this.getRoom(roomId);
    await room.pauseConsumer(peerId, consumerId);
  }

  async resumeConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = await this.getRoom(roomId);
    await room.resumeConsumer(peerId, consumerId);
  }

  async closeProducer(roomId: string, peerId: string, producerId: string) {
    const room = await this.getRoom(roomId);
    room.closeProducer(peerId, producerId);
  }

  async closeConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = await this.getRoom(roomId);
    room.closeConsumer(peerId, consumerId);
  }

  async getProducerListForPeer(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    return room.getProducerListForPeer(peerId);
  }

  async getOtherProducers(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    return room.getOtherProducers(peerId);
  }
}
