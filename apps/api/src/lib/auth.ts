import { betterAuth } from "better-auth";
import { DB, drizzleAdapter } from "better-auth/adapters/drizzle";

export interface AuthOptionsEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SITE_URL: string;
}

export interface AuthOptions {
  db: DB;
  env: AuthOptionsEnv;
}

export function getAuthInstance(opts: AuthOptions) {
  return betterAuth({
    trustedOrigins: [opts.env.SITE_URL],
    database: drizzleAdapter(opts.db, { provider: "pg" }),
    socialProviders: {
      github: {
        clientId: opts.env.GITHUB_CLIENT_ID,
        clientSecret: opts.env.GITHUB_CLIENT_SECRET,
      },
    },
  });
}

export const auth = getAuthInstance({
  db: {},
  env: {
    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    SITE_URL: "http://localhost:3000",
  },
});
