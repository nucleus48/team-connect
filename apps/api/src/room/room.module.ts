import { DbModule } from "@/db/db.module";
import { Module } from "@nestjs/common";
import { RouterModule } from "../router/router.module";
import { RoomController } from "./room.controller";
import { RoomGateway } from "./room.gateway";
import { RoomService } from "./room.service";

@Module({
  imports: [RouterModule, DbModule],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway],
})
export class RoomModule {}
