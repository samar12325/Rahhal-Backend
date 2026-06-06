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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../../common/guards/admin.guard");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const contact_service_1 = require("./contact.service");
const admin_contact_messages_query_dto_1 = require("./dto/admin-contact-messages-query.dto");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const reply_contact_message_dto_1 = require("./dto/reply-contact-message.dto");
let ContactController = class ContactController {
    contactService;
    constructor(contactService) {
        this.contactService = contactService;
    }
    create(dto, req) {
        return this.contactService.create(dto, {
            ipAddress: req.ip,
            userAgent: req.get('user-agent') ?? null,
        });
    }
    list(query) {
        return this.contactService.list(query);
    }
    unreadCount() {
        return this.contactService.getUnreadCount();
    }
    details(id) {
        return this.contactService.getDetails(id);
    }
    reply(id, dto) {
        return this.contactService.reply(id, dto);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_dto_1.CreateContactDto, Object]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/contact-messages'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_contact_messages_query_dto_1.AdminContactMessagesQueryDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('admin/contact-messages/unread-count'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Get)('admin/contact-messages/:id'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "details", null);
__decorate([
    (0, common_1.Patch)('admin/contact-messages/:id/reply'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reply_contact_message_dto_1.ReplyContactMessageDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "reply", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map