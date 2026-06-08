"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
let EmailService = class EmailService {
    mailerService;
    config;
    constructor(mailerService, config) {
        this.mailerService = mailerService;
        this.config = config;
    }
    getMailConfig() {
        const user = this.config.get('MAIL_USER')?.trim();
        const pass = this.config.get('MAIL_PASS')?.trim();
        const fromName = this.config.get('MAIL_FROM_NAME')?.trim() || 'RAHHAL';
        const contactTo = this.config.get('CONTACT_TO')?.trim() || user || null;
        if (!user || !pass) {
            return null;
        }
        return {
            user,
            pass,
            fromName,
            contactTo,
        };
    }
    async sendEmail(to, subject, html) {
        await this.mailerService.sendMail({
            to,
            subject,
            html,
            textEncoding: 'base64',
            headers: {
                'Content-Language': 'ar',
            },
        });
    }
    async send(input) {
        const mailConfig = this.getMailConfig();
        if (!mailConfig) {
            return {
                sent: false,
                error: 'Missing mail configuration',
            };
        }
        try {
            await this.mailerService.sendMail({
                to: input.to,
                subject: input.subject,
                html: input.html,
                text: input.text,
                textEncoding: 'base64',
                replyTo: input.replyTo,
                from: this.buildFromHeader(input.fromName || mailConfig.fromName),
                headers: {
                    'Content-Language': 'ar',
                },
            });
            return { sent: true, error: null };
        }
        catch (error) {
            return {
                sent: false,
                error: this.extractError(error),
            };
        }
    }
    extractError(error) {
        if (!error)
            return 'Unknown error';
        if (typeof error === 'string')
            return error;
        if (error instanceof Error && error.message.trim()) {
            return error.message.trim();
        }
        return 'Unknown error';
    }
    buildFromHeader(fromName) {
        const user = this.config.get('MAIL_USER')?.trim();
        return user ? `"${fromName}" <${user}>` : undefined;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map