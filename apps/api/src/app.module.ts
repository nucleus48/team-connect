import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { DB_INSTANCE } from "./db/db";
import { DbModule } from "./db/db.module";
import { getAuthInstance } from "./lib/auth";
import { RoomModule } from "./room/room.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRootAsync({
      imports: [DbModule],
      inject: [DB_INSTANCE, ConfigService],
      useFactory: (db: DB_INSTANCE, configService: ConfigService) => ({
        auth: getAuthInstance({
          db,
          env: {
            SITE_URL: configService.getOrThrow<string>("SITE_URL"),
            GITHUB_CLIENT_ID:
              configService.getOrThrow<string>("GITHUB_CLIENT_ID"),
            GITHUB_CLIENT_SECRET: configService.getOrThrow<string>(
              "GITHUB_CLIENT_SECRET",
            ),
          },
        }),
      }),
    }),
    RoomModule,
  ],
})
export class AppModule {}
