import { Injectable } from "@nestjs/common";
import mediasoup from "mediasoup";
import { config } from "../config/mediasoup.config";
import { Room } from "./room";
import { RouterWorker } from "./router.worker";

@Injectable()
export class RouterService {
  private rooms = new Map<string, Room>();

  constructor(private routerWorker: RouterWorker) {}

  async createRoom(roomId: string) {
    const worker = this.routerWorker.worker;
    const router = await worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });
    const room = new Room(roomId, router);
    this.rooms.set(roomId, room);
    return roomId;
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }
    return room;
  }

  addPeerToRoom(roomId: string, peerId: string, name: string) {
    const room = this.getRoom(roomId);
    room.addPeer(peerId, name);
  }

  getRouterRtpCapabilities(roomId: string) {
    const room = this.getRoom(roomId);
    return room.getRouterRtpCapabilities();
  }

  async createWebRtcTransport(roomId: string, peerId: string) {
    const room = this.getRoom(roomId);
    return await room.createWebRtcTransport(peerId);
  }

  async connectWebRtcTransport(
    roomId: string,
    peerId: string,
    transportId: string,
    dtlsParameters: mediasoup.types.DtlsParameters,
  ) {
    const room = this.getRoom(roomId);
    await room.connectWebRtcTransport(peerId, transportId, dtlsParameters);
  }

  async produce(
    roomId: string,
    peerId: string,
    transportId: string,
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters,
  ) {
    const room = this.getRoom(roomId);
    return await room.produce(peerId, transportId, kind, rtpParameters);
  }

  async consume(
    roomId: string,
    peerId: string,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ) {
    const room = this.getRoom(roomId);
    return await room.consume(
      peerId,
      consumerTransportId,
      producerId,
      rtpCapabilities,
    );
  }

  closeProducer(roomId: string, peerId: string, producerId: string) {
    const room = this.getRoom(roomId);
    room.closeProducer(peerId, producerId);
  }

  closeConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = this.getRoom(roomId);
    room.closeConsumer(peerId, consumerId);
  }

  getProducerListForPeer(roomId: string, peerId: string) {
    const room = this.getRoom(roomId);
    return room.getProducerListForPeer(peerId);
  }

  getOtherProducers(roomId: string, peerId: string) {
    const room = this.getRoom(roomId);
    return room.getOtherProducers(peerId);
  }
}
