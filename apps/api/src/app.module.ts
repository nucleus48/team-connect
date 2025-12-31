import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { DbModule } from "./db/db.module";
import { auth } from "./lib/auth";
import { RoomModule } from "./room/room.module";
import { RouterModule } from "./router/router.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BetterAuthModule.forRoot({ auth }),
    DbModule,
    RoomModule,
    RouterModule,
  ],
})
export class AppModule {}
