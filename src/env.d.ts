import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ANTHROPIC_API_KEY: string;
    RESEND_API_KEY: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    NEXT_PUBLIC_APP_URL: string;
  }
}

export {};