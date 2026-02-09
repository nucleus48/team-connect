declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    DATABASE_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    SITE_URL: string;
    RTC_MIN_PORT: string;
    RTC_MAX_PORT: string;
    ANNOUNCED_IP: string;
  }
}
