import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { MediaRouters } from "./media.routers";

@Injectable()
export class MediaTransports {
  private readonly transports: Map<string, types.WebRtcTransport> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaRouters: MediaRouters,
  ) {}

  async createWebRtcTransport(routerId: string) {
    const router = this.mediaRouters.get(routerId);

    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: this.configService.getOrThrow<string>("ANNOUNCED_IP"),
        },
      ],
    });

    this.transports.set(transport.id, transport);

    transport.on("routerclose", () => {
      this.close(transport.id);
    });

    return transport;
  }

  async connectTransport(
    transportId: string,
    dtlsParameters: types.DtlsParameters,
  ) {
    const transport = this.get(transportId);
    await transport.connect({ dtlsParameters });
  }

  get(transportId: string) {
    const transport = this.transports.get(transportId);

    if (!transport) {
      throw new WsException("Transport not found");
    }

    return transport;
  }

  close(transportId: string) {
    const transport = this.transports.get(transportId);
    this.transports.delete(transportId);
    transport?.close();
  }
}
