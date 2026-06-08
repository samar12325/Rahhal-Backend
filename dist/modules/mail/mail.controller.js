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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const common_1 = require("@nestjs/common");
const test_email_dto_1 = require("./dto/test-email.dto");
const email_service_1 = require("./email.service");
let MailController = class MailController {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendTestEmail(dto) {
        if (!this.emailService.getMailConfig()) {
            throw new common_1.ServiceUnavailableException('Mail is not configured');
        }
        try {
            await this.emailService.sendEmail(dto.email, 'Test Email From RAHHAL', `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Test Email From RAHHAL</h2>
            <p>This is a Gmail SMTP test email from the Rahhal backend.</p>
          </div>
        `);
            return {
                ok: true,
                message: 'Test email sent successfully',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(this.emailService.extractError(error));
        }
    }
};
exports.MailController = MailController;
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_email_dto_1.TestEmailDto]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "sendTestEmail", null);
exports.MailController = MailController = __decorate([
    (0, common_1.Controller)('mail'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], MailController);
//# sourceMappingURL=mail.controller.js.map