import { Module } from "@nestjs/common";
import { MediaGateway } from "./media.gateway";
import { MediaService } from "./media.service";
import { MediaConsumers } from "./providers/media.consumers";
import { MediaProducers } from "./providers/media.producers";
import { MediaRouters } from "./providers/media.routers";
import { MediaStreams } from "./providers/media.streams";
import { MediaTransports } from "./providers/media.transports";
import { MediaWorkers } from "./providers/media.workers";

@Module({
  providers: [
    MediaService,
    MediaGateway,
    MediaWorkers,
    MediaRouters,
    MediaTransports,
    MediaStreams,
    MediaConsumers,
    MediaProducers,
  ],
})
export class MediaModule {}
