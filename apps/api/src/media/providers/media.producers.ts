import { Injectable } from "@nestjs/common";
import { types } from "mediasoup";
import { MediaTransports } from "./media.transports";

@Injectable()
export class MediaProducers {
  private readonly producers: Map<string, types.Producer> = new Map();

  constructor(private readonly mediaTransports: MediaTransports) {}

  async produce(
    transportId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const producer = await this.mediaTransports.get(transportId).produce({
      kind,
      rtpParameters,
    });

    this.producers.set(producer.id, producer);

    return producer;
  }

  close(producerId: string) {
    const producer = this.producers.get(producerId);
    this.producers.delete(producerId);
    producer?.close();
  }
}
