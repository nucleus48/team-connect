import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./drizzle",
  dialect: "sqlite",
  schema: "./src/db/entities",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
