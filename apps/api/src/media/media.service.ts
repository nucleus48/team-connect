import { WorkersService } from "@/workers/workers.service";
import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import {
  ConnectTransportDto,
  CreateConsumerDto,
  CreateProducerDto,
} from "./media.dto";
import { MediaRouter } from "./media.router";

@Injectable()
export class MediaService {
  private routers: Map<string, MediaRouter> = new Map();

  constructor(private readonly workersService: WorkersService) {}

  private getRouter(routerId: string) {
    const router = this.routers.get(routerId);

    if (!router) {
      throw new WsException("Router not found");
    }

    return router;
  }

  private async createRouter(routerId: string) {
    const worker = this.workersService.getWorker();
    const router = await MediaRouter.createRouter(worker);
    this.routers.set(routerId, router);
    return router;
  }

  async getRouterRtpCapabilities(routerId: string) {
    let router = this.routers.get(routerId);

    if (!router) {
      router = await this.createRouter(routerId);
    }

    return router.rtpCapabilities;
  }

  async createWebRtcTransport(routerId: string, socket: Socket) {
    const router = this.getRouter(routerId);
    const transport = await router.createWebRtcTransport(socket.id);
    await socket.join(routerId);
    return transport;
  }

  async connectTransport(data: ConnectTransportDto) {
    const router = this.getRouter(data.routerId);
    await router.connectTransport(data.transportId, data.dtlsParameters);
  }

  async createProducer(data: CreateProducerDto) {
    const router = this.getRouter(data.routerId);
    const producer = await router.createProducer(
      data.transportId,
      data.kind,
      data.rtpParameters,
    );
    return producer;
  }

  async createConsumer(data: CreateConsumerDto) {
    const router = this.getRouter(data.routerId);
    const consumer = await router.createConsumer(
      data.transportId,
      data.producerId,
      data.rtpCapabilities,
    );
    return consumer;
  }

  closeTransport(routerId: string, transportId: string) {
    const router = this.getRouter(routerId);
    router.closeTransport(transportId);

    if (!router.transportLength) {
      this.closeRouter(routerId);
    }
  }

  closeRouter(routerId: string) {
    const router = this.getRouter(routerId);
    router.close();
    this.routers.delete(routerId);
  }
}
