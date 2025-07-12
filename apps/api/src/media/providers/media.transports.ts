import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import { types } from "mediasoup";
import { TransportData } from "../media.types";
import { MediaRouters } from "./media.routers";

@Injectable()
export class MediaTransports {
  private transports: Map<string, types.WebRtcTransport<TransportData>> =
    new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mediaRouters: MediaRouters,
  ) {}

  async createWebRtcTransport(routerId: string, clientId: string) {
    const router = this.mediaRouters.get(routerId);

    const transport = await router.createWebRtcTransport({
      appData: { clientId },
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

  closeByClientId(clientId: string) {
    this.transports.forEach((transport) => {
      if (transport.appData.clientId === clientId) {
        this.transports.delete(transport.id);
        transport.close();
      }
    });
  }
}
