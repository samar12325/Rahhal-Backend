import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    DB_HOST: z.ZodDefault<z.ZodString>;
    DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_USER: z.ZodDefault<z.ZodString>;
    DB_PASS: z.ZodOptional<z.ZodString>;
    DB_NAME: z.ZodDefault<z.ZodString>;
    DB_POOL_LIMIT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    RESET_TOKEN_PEPPER: z.ZodString;
    ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    REFRESH_EXPIRES_IN_DAYS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    FRONTEND_URL: z.ZodDefault<z.ZodString>;
    MAIL_USER: z.ZodOptional<z.ZodString>;
    MAIL_PASS: z.ZodOptional<z.ZodString>;
    MAIL_FROM_NAME: z.ZodDefault<z.ZodString>;
    CONTACT_TO: z.ZodOptional<z.ZodString>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    OPENAI_MODEL: z.ZodDefault<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
