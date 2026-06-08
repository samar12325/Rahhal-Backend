"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    DB_HOST: zod_1.z.string().min(1).default('127.0.0.1'),
    DB_PORT: zod_1.z.coerce.number().int().positive().default(3306),
    DB_USER: zod_1.z.string().min(1).default('root'),
    DB_PASS: zod_1.z.string().optional(),
    DB_NAME: zod_1.z.string().min(1).default('rahhal'),
    DB_POOL_LIMIT: zod_1.z.coerce.number().int().positive().default(10),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    RESET_TOKEN_PEPPER: zod_1.z.string().min(32),
    ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_EXPIRES_IN_DAYS: zod_1.z.coerce.number().int().positive().default(7),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    MAIL_USER: zod_1.z.string().email().optional(),
    MAIL_PASS: zod_1.z.string().min(1).optional(),
    MAIL_FROM_NAME: zod_1.z.string().min(1).default('RAHHAL'),
    CONTACT_TO: zod_1.z.string().email().optional(),
    OPENAI_API_KEY: zod_1.z.string().min(20).optional(),
    OPENAI_MODEL: zod_1.z.string().min(1).default('gpt-4.1-mini'),
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
});
//# sourceMappingURL=env.schema.js.map