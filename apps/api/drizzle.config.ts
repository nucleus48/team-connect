import { defineConfig } from "drizzle-kit";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
