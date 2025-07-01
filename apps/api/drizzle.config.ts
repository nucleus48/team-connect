import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  strict: true,
  verbose: true,
  out: "./drizzle",
  dialect: "sqlite",
  casing: "snake_case",
  schema: "./src/db/entities",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
