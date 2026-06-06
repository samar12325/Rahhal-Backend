"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const env_1 = require("./config/env");
const auth_module_1 = require("./modules/auth/auth.module");
const destinations_module_1 = require("./modules/destinations/destinations.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const users_module_1 = require("./modules/users/users.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: () => (0, env_1.validateEnv)(),
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { singleLine: true } }
                        : undefined,
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            destinations_module_1.DestinationsModule,
            reviews_module_1.ReviewsModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map