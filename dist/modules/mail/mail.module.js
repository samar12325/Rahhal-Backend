"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailModule = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const email_service_1 = require("./email.service");
const mail_controller_1 = require("./mail.controller");
let MailModule = class MailModule {
};
exports.MailModule = MailModule;
exports.MailModule = MailModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const user = config.get('MAIL_USER');
                    const pass = config.get('MAIL_PASS');
                    const fromName = config.get('MAIL_FROM_NAME') || 'RAHHAL';
                    return {
                        transport: {
                            service: 'gmail',
                            auth: {
                                user,
                                pass,
                            },
                        },
                        defaults: {
                            from: user ? `"${fromName}" <${user}>` : undefined,
                        },
                    };
                },
            }),
        ],
        controllers: [mail_controller_1.MailController],
        providers: [email_service_1.EmailService],
        exports: [email_service_1.EmailService, mailer_1.MailerModule],
    })
], MailModule);
//# sourceMappingURL=mail.module.js.map