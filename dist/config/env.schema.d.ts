import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    REFRESH_EXPIRES_IN_DAYS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
