import { WorkersModule } from "@/workers/workers.module";
import { Module } from "@nestjs/common";
import { MediaGateway } from "./media.gateway";
import { MediaService } from "./media.service";

@Module({
  imports: [WorkersModule],
  providers: [MediaService, MediaGateway],
})
export class MediaModule {}
