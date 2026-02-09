import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DB_INSTANCE, getDbInstance } from "./db";

@Module({
  providers: [
    {
      provide: DB_INSTANCE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return getDbInstance(configService.getOrThrow("DATABASE_URL"));
      },
    },
  ],
  exports: [DB_INSTANCE],
})
export class DbModule {}
