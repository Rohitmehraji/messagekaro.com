import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('./messagekaro.db'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  SMS_PROVIDER: z.enum(['twilio', 'mock']).default('mock'),
  SCHEDULER_CRON: z.string().default('*/1 * * * *'),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  API_RATE_LIMIT_MAX: z.coerce.number().default(300)
});

export const env = envSchema.parse(process.env);
