import 'dotenv/config'
import { z } from 'zod'

const booleanEnv = z.preprocess((value) => (typeof value === 'string' ? value.toLowerCase() === 'true' : value), z.boolean())

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JSON_BODY_LIMIT: z.string().default('1mb'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  ACCESS_TOKEN_SECRET: z.string().min(1).default('dev-access-secret'),
  REFRESH_TOKEN_SECRET: z.string().min(1).default('dev-refresh-secret'),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  ACCESS_TOKEN_COOKIE_NAME: z.string().min(1).default('minld_pfl_access'),
  REFRESH_TOKEN_COOKIE_NAME: z.string().min(1).default('minld_pfl_refresh'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_SECURE: booleanEnv.default(false),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanEnv.default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('MinLD.PFL <no-reply@example.com>'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  MEDIA_MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  ...parsedEnv,
  COOKIE_SECURE: parsedEnv.NODE_ENV === 'production' ? true : parsedEnv.COOKIE_SECURE,
  get CORS_ORIGINS() {
    return parsedEnv.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  },
}
