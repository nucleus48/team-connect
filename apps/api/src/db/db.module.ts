import { Global, Module, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { schema } from "./entities/schema";

export const DATABASE = "DATABASE";
export type Database = LibSQLDatabase<typeof schema>;

const DBProvider: Provider = {
  provide: DATABASE,
  useFactory: (configService: ConfigService) =>
    drizzle(configService.getOrThrow<string>("DB_FILE_NAME"), { schema }),
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [DBProvider],
  exports: [DBProvider],
})
export class DBModule {}
