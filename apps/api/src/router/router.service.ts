import { Injectable } from "@nestjs/common";
import * as mediasoup from "mediasoup";
import { config } from "../config/mediasoup.config";
import { ProducerData, Room } from "./room";
import { RouterWorker } from "./router.worker";

@Injectable()
export class RouterService {
  private rooms = new Map<string, Room>();

  constructor(private routerWorker: RouterWorker) {}

  private async createRoom(roomId: string) {
    const router = await this.routerWorker.worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });
    const room = new Room(roomId, router);
    this.rooms.set(roomId, room);
    return room;
  }

  private async getRoom(roomId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      const room = await this.createRoom(roomId);
      return room;
    }

    return room;
  }

  async addPeerToRoom(roomId: string, peerId: string, userId: string) {
    const room = await this.getRoom(roomId);
    room.addPeer(peerId, userId);
  }

  async getOtherPeers(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    return room.getOtherPeers(peerId);
  }

  async updateRoomPresenter(
    roomId: string,
    peerId: string,
    presenting: boolean,
  ) {
    const room = await this.getRoom(roomId);
    room.updatePeerPresenting(peerId, presenting);
  }

  async removePeerFromRoom(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    room.removePeer(peerId);

    if (room.peersLength <= 0) {
      room.router.close();
      this.rooms.delete(roomId);
    }
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
    appData: ProducerData,
  ) {
    const room = await this.getRoom(roomId);
    return await room.produce(
      peerId,
      transportId,
      kind,
      rtpParameters,
      appData,
    );
  }

  async getOtherProducers(roomId: string, peerId: string) {
    const room = await this.getRoom(roomId);
    return room.getOtherProducers(peerId);
  }

  async updateProducerData(
    roomId: string,
    peerId: string,
    producerId: string,
    appData: Partial<ProducerData>,
  ) {
    const room = await this.getRoom(roomId);
    room.updateProducerData(peerId, producerId, appData);
  }

  async closeProducer(roomId: string, peerId: string, producerId: string) {
    const room = await this.getRoom(roomId);
    return room.closeProducer(peerId, producerId);
  }

  async consume(
    roomId: string,
    peerId: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: mediasoup.types.RtpCapabilities,
  ) {
    const room = await this.getRoom(roomId);
    return await room.consume(peerId, transportId, producerId, rtpCapabilities);
  }

  async resumeConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = await this.getRoom(roomId);
    await room.resumeConsumer(peerId, consumerId);
  }

  async closeConsumer(roomId: string, peerId: string, consumerId: string) {
    const room = await this.getRoom(roomId);
    room.closeConsumer(peerId, consumerId);
  }
}
