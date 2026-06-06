export declare function validateEnv(): {
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    ACCESS_EXPIRES_IN: string;
    REFRESH_EXPIRES_IN_DAYS: number;
    NODE_ENV: "development" | "production" | "test";
};
