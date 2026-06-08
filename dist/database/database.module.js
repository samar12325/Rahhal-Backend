"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.MYSQL_POOL = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promise_1 = require("mysql2/promise");
exports.MYSQL_POOL = Symbol('MYSQL_POOL');
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.MYSQL_POOL,
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const pool = (0, promise_1.createPool)({
                        host: configService.get('DB_HOST', '127.0.0.1'),
                        port: configService.get('DB_PORT', 3306),
                        user: configService.get('DB_USER'),
                        password: configService.get('DB_PASS') || undefined,
                        database: configService.get('DB_NAME', 'rahhal'),
                        waitForConnections: true,
                        connectionLimit: configService.get('DB_POOL_LIMIT', 10),
                        dateStrings: false,
                        namedPlaceholders: true,
                    });
                    return pool;
                },
            },
        ],
        exports: [exports.MYSQL_POOL],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map