import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).default("super-secret-jwt-key-change-me-in-prod"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  
  // App specific
  VITE_APP_ID: z.string().optional(),
  OAUTH_SERVER_URL: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  HUBSPOT_API_KEY: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const ENV = {
  ...parsed,
  appId: parsed.VITE_APP_ID,
  cookieSecret: parsed.JWT_SECRET,
  databaseUrl: parsed.DATABASE_URL,
  oAuthServerUrl: parsed.OAUTH_SERVER_URL,
  ownerOpenId: parsed.OWNER_OPEN_ID,
  isProduction: parsed.NODE_ENV === "production",
  forgeApiUrl: parsed.BUILT_IN_FORGE_API_URL,
  forgeApiKey: parsed.BUILT_IN_FORGE_API_KEY,
  hubspotApiKey: parsed.HUBSPOT_API_KEY,
};
