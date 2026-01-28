import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const DB_INSTANCE = Symbol("DN_INSTANCE");
export type DB_INSTANCE = ReturnType<typeof getDbInstance>;

export const getDbInstance = (dbUrl: string) => drizzle(dbUrl, { schema });
