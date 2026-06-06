"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const env_schema_1 = require("./env.schema");
function validateEnv() {
    const parsed = env_schema_1.envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
        process.exit(1);
    }
    return parsed.data;
}
//# sourceMappingURL=env.js.map