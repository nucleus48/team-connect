import "dotenv/config";

import { Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DB_FILE_NAME = process.env.DB_FILE_NAME;

if (!DB_FILE_NAME) {
  throw new Error("DB_FILE_NAME env cannot be undefined");
}

export const DbService = "DbService";
export const db = drizzle(DB_FILE_NAME, { schema });

export type DbService = typeof db;

@Module({
  providers: [
    {
      provide: DbService,
      useValue: db,
    },
  ],
  exports: [DbService],
})
export class DbModule {}
