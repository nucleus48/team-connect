import { AuthModule } from "@/auth/auth.module";
import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { RoomRolesGuard } from "./rooms.guard";

@Module({
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomRolesGuard],
  exports: [RoomsService, RoomRolesGuard],
})
export class RoomsModule {}
