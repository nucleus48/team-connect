import { betterAuth } from "better-auth";
import { DB, drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";

export interface AuthOptions {
  db: DB;
  trustedOrigins: string[];
  githubClientId: string;
  githubClientSecret: string;
}

export function getAuthInstance(options: AuthOptions) {
  return betterAuth({
    trustedOrigins: options.trustedOrigins,
    database: drizzleAdapter(options.db, { provider: "sqlite" }),
    socialProviders: {
      github: {
        clientId: options.githubClientId,
        clientSecret: options.githubClientSecret,
      },
    },
    plugins: [openAPI()],
  });
}

export const auth = getAuthInstance({
  db: {},
  trustedOrigins: [],
  githubClientId: "",
  githubClientSecret: "",
});
