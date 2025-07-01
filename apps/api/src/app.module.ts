import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DBModule } from "./db/db.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.development.local",
    }),
    DBModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
