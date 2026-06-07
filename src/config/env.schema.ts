import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default('root'),
  DB_PASS: z.string().optional(),
  DB_NAME: z.string().min(1).default('rahhal'),
  DB_POOL_LIMIT: z.coerce.number().int().positive().default(10),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  RESET_TOKEN_PEPPER: z.string().min(32),

  ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MAIL_USER: z.string().email().optional(),
  MAIL_PASS: z.string().min(1).optional(),
  MAIL_FROM_NAME: z.string().min(1).default('RAHHAL'),
  CONTACT_TO: z.string().email().optional(),
  OPENAI_API_KEY: z.string().min(20).optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-4.1-mini'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type Env = z.infer<typeof envSchema>;
