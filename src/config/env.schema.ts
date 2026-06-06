import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;
