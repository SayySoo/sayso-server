import dotenv from "dotenv";
import { z } from "zod";

// silent: no "injected env" noise inside Docker
dotenv.config({quiet: true});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("8000")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), {
      message: "PORT must be a valid number",
    }),
  // redis validation setup
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379").transform((v) => parseInt(v,10)),
  // setup db validations
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("3306").transform((v) => parseInt(v,10)),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("campusfix"),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  LANDING_URL: z.string().url(),
  LANDING_SESSION_SECRET: z.string().min(32),
  LANDING_SESSION_TTL: z.coerce.number().int().positive().default(86400),
  STUDENT_URL: z.string().url().optional(),
  RAG_API_URL: z.string().url().optional(),

  
  

});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:");
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  NODE_ENV: parsed.data.NODE_ENV,
  PORT: parsed.data.PORT,
  REDIS_HOST: parsed.data.REDIS_HOST,
  REDIS_PORT: parsed.data.REDIS_PORT,
  DB_HOST: parsed.data.DB_HOST,
  DB_PORT: parsed.data.DB_PORT,
  DB_USER: parsed.data.DB_USER,
  DB_PASSWORD: parsed.data.DB_PASSWORD,
  DB_NAME: parsed.data.DB_NAME,
  isDev: parsed.data.NODE_ENV === "development",
  isProd: parsed.data.NODE_ENV === "production",
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN,
  GOOGLE_CLIENT_ID: parsed.data.GOOGLE_CLIENT_ID,
  LANDING_URL: parsed.data.LANDING_URL,
  LANDING_SESSION_SECRET: parsed.data.LANDING_SESSION_SECRET,
  LANDING_SESSION_TTL: parsed.data.LANDING_SESSION_TTL,
  STUDENT_URL: parsed.data.STUDENT_URL,
  RAG_API_URL: parsed.data.RAG_API_URL,
};