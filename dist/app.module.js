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
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const admin_approvals_module_1 = require("./modules/admin-approvals/admin-approvals.module");
const admin_trips_module_1 = require("./modules/admin-trips/admin-trips.module");
const destinations_module_1 = require("./modules/destinations/destinations.module");
const group_trips_module_1 = require("./modules/group-trips/group-trips.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const school_trips_module_1 = require("./modules/school-trips/school-trips.module");
const trips_module_1 = require("./modules/trips/trips.module");
const users_module_1 = require("./modules/users/users.module");
const contact_module_1 = require("./modules/contact/contact.module");
const mail_module_1 = require("./modules/mail/mail.module");
const prisma_module_1 = require("./prisma/prisma.module");
const stats_module_1 = require("./stats/stats.module");
const ai_trips_module_1 = require("./modules/ai-trips/ai-trips.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const events_module_1 = require("./modules/events/events.module");
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
            database_module_1.DatabaseModule,
            prisma_module_1.PrismaModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            admin_approvals_module_1.AdminApprovalsModule,
            admin_trips_module_1.AdminTripsModule,
            destinations_module_1.DestinationsModule,
            group_trips_module_1.GroupTripsModule,
            reviews_module_1.ReviewsModule,
            school_trips_module_1.SchoolTripsModule,
            trips_module_1.TripsModule,
            users_module_1.UsersModule,
            contact_module_1.ContactModule,
            stats_module_1.StatsModule,
            ai_trips_module_1.AiTripsModule,
            bookings_module_1.BookingsModule,
            events_module_1.EventsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map