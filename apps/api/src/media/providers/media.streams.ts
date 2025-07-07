import { Injectable } from "@nestjs/common";
import { IMediaSocket, IMediaStream } from "../media.interface";
import { MediaProducers } from "./media.producers";

@Injectable()
export class MediaStreams {
  private readonly mediaStreams: Map<string, IMediaStream> = new Map();

  constructor(private readonly mediaProducers: MediaProducers) {}

  create(client: IMediaSocket, streamId: string, transportId: string) {
    const stream = {
      id: streamId,
      transportId,
      producers: [],
      clientId: client.id,
      routerId: client.routerId,
    };

    this.mediaStreams.set(streamId, stream);

    client.to(client.routerId).emit("newStream", stream);

    return stream;
  }

  get(streamId: string) {
    const stream = this.mediaStreams.get(streamId);
    return stream;
  }

  getStreams(routerId: string) {
    const streams = Array.from(this.mediaStreams.values()).filter(
      (stream) => stream.routerId === routerId,
    );

    return streams;
  }

  close(client: IMediaSocket, streamId: string) {
    const stream = this.mediaStreams.get(streamId);

    if (stream) {
      this.mediaStreams.delete(streamId);

      stream.producers.forEach((producerId) => {
        this.mediaProducers.close(producerId);
      });

      client.to(client.routerId).emit("closeStream", streamId);
    }
  }

  closeProducer(client: IMediaSocket, streamId: string, producerId: string) {
    const stream = this.get(streamId);

    if (stream) {
      this.mediaProducers.close(producerId);
      stream.producers = stream.producers.filter(
        (producerId) => producerId !== producerId,
      );

      client
        .to(client.routerId)
        .emit("closeProducer", { id: producerId, streamId });
    }
  }

  closeStreams(client: IMediaSocket, transportId: string) {
    const streams = Array.from(this.mediaStreams.values()).filter(
      (stream) => stream.transportId === transportId,
    );

    streams.forEach((stream) => {
      this.close(client, stream.id);
    });
  }
}
