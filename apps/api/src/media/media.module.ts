import { AuthModule } from "@/auth/auth.module";
import { RoomsModule } from "@/rooms/rooms.module";
import { Module } from "@nestjs/common";
import { MediaGateway } from "./media.gateway";
import { MediaService } from "./media.service";
import { MediaWorkers } from "./media.workers";

@Module({
  imports: [AuthModule, RoomsModule],
  providers: [MediaService, MediaGateway, MediaWorkers],
})
export class MediaModule {}
