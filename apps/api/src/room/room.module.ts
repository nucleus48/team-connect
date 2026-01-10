import { DbModule } from "@/db/db.module";
import { Module } from "@nestjs/common";
import { RouterModule } from "../router/router.module";
import { RoomController } from "./room.controller";
import { RoomGateway } from "./room.gateway";
import { RoomGuard } from "./room.guard";
import { RoomService } from "./room.service";

@Module({
  imports: [RouterModule, DbModule],
  providers: [RoomService, RoomGateway, RoomGuard],
  controllers: [RoomController],
})
export class RoomModule {}
