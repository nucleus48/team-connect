import { Injectable } from "@nestjs/common";
import { types } from "mediasoup";
import { ProducerData } from "../media.types";
import { MediaTransports } from "./media.transports";

@Injectable()
export class MediaProducers {
  private readonly producers: Map<string, types.Producer<ProducerData>> =
    new Map();

  constructor(private readonly mediaTransports: MediaTransports) {}

  async produce(
    routerId: string,
    transportId: string,
    streamId: string,
    kind: types.MediaKind,
    rtpParameters: types.RtpParameters,
  ) {
    const producer = await this.mediaTransports.get(transportId).produce({
      kind,
      rtpParameters,
      paused: true,
      appData: { streamId, routerId },
    });

    this.producers.set(producer.id, producer);

    return producer;
  }

  async pause(producerId: string) {
    await this.producers.get(producerId)?.pause();
  }

  async resume(producerId: string) {
    await this.producers.get(producerId)?.resume();
  }

  close(producerId: string) {
    const producer = this.producers.get(producerId);
    this.producers.delete(producerId);
    producer?.close();
  }

  getByRouterId(routerId: string) {
    const producers = Array.from(this.producers.values()).filter(
      (producer) => producer.appData.routerId === routerId,
    );

    return producers.map((producer) => ({
      id: producer.id,
      kind: producer.kind,
      streamId: producer.appData.streamId,
      paused: producer.paused,
    }));
  }
}
