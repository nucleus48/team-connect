import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { DbModule } from "./db/db.module";
import { auth } from "./lib/auth";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BetterAuthModule.forRoot({ auth }),
    DbModule,
  ],
})
export class AppModule {}
