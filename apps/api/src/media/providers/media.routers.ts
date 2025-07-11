import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { RouterData } from "../media.interface";
import { MediaWorkers } from "./media.workers";

@Injectable()
export class MediaRouters {
  private readonly routers: Map<string, types.Router<RouterData>> = new Map();

  constructor(private readonly mediaWorkers: MediaWorkers) {}

  async createRouter(owner: string) {
    const worker = this.mediaWorkers.worker;

    const router = await worker.createRouter({
      appData: { owner },
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

    this.routers.set(router.id, router);

    router.on("workerclose", () => this.close(router.id));

    setTimeout(() => this.close(router.id), 24 * 60 * 60 * 1000);

    return router;
  }

  getRouterRtpCapabilities(routerId: string) {
    const router = this.get(routerId);
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
