import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { MediaWorkers } from "./media.workers";

@Injectable()
export class MediaRouters {
  private readonly routers: Map<string, types.Router> = new Map();

  constructor(private readonly mediaWorkers: MediaWorkers) {}

  private async createRouter(routerId: string) {
    const worker = this.mediaWorkers.worker;

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

    router.on("workerclose", () => this.close(routerId));

    setTimeout(() => this.close(routerId), 24 * 60 * 60 * 1000);

    return router;
  }

  async getRouterRtpCapabilities(routerId: string) {
    let router = this.routers.get(routerId);

    if (!router) {
      router = await this.createRouter(routerId);
    }

    return router.rtpCapabilities;
  }

  get(routerId: string) {
    const router = this.routers.get(routerId);

    if (!router) {
      throw new WsException("Router not found");
    }

    return router;
  }

  private close(routerId: string) {
    const router = this.routers.get(routerId);
    this.routers.delete(routerId);
    router?.close();
  }
}
