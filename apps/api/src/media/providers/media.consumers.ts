import { Injectable } from "@nestjs/common";
import { types } from "mediasoup";
import { MediaTransports } from "./media.transports";

@Injectable()
export class MediaConsumers {
  private readonly consumers: Map<string, types.Consumer> = new Map();

  constructor(private readonly mediaTransports: MediaTransports) {}

  async consume(
    transportId: string,
    producerId: string,
    rtpCapabilities: types.RtpCapabilities,
  ) {
    const consumer = await this.mediaTransports.get(transportId).consume({
      producerId,
      rtpCapabilities,
    });

    this.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      this.close(consumer.id);
    });

    consumer.on("producerclose", () => {
      this.close(consumer.id);
    });

    return consumer;
  }

  private close(consumerId: string) {
    const consumer = this.consumers.get(consumerId);
    this.consumers.delete(consumerId);
    consumer?.close();
  }
}
