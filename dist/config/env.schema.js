"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_EXPIRES_IN_DAYS: zod_1.z.coerce.number().int().positive().default(7),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
//# sourceMappingURL=env.schema.js.map