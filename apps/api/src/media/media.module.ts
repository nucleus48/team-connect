import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaGateway } from "./media.gateway";
import { MediaService } from "./media.service";
import { MediaConsumers } from "./providers/media.consumers";
import { MediaProducers } from "./providers/media.producers";
import { MediaRouters } from "./providers/media.routers";
import { MediaTransports } from "./providers/media.transports";
import { MediaWorkers } from "./providers/media.workers";

@Module({
  providers: [
    MediaService,
    MediaGateway,
    MediaWorkers,
    MediaRouters,
    MediaTransports,
    MediaConsumers,
    MediaProducers,
  ],
  controllers: [MediaController],
})
export class MediaModule {}
