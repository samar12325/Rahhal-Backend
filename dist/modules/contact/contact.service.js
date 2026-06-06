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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../mail/email.service");
let ContactService = class ContactService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async create(dto, meta = {}) {
        const created = await this.prisma.contact_messages.create({
            data: {
                name: dto.name.trim(),
                email: dto.email.trim().toLowerCase(),
                type: dto.type,
                message: dto.message.trim(),
                status: client_1.contact_status.new,
                created_at: new Date(),
                ip_address: this.normalizeIp(meta.ipAddress),
                user_agent: this.trimText(meta.userAgent, 1000),
            },
        });
        const mailConfig = this.emailService.getMailConfig();
        if (!mailConfig || !mailConfig.contactTo) {
            return {
                ok: true,
                id: created.id.toString(),
                sent: false,
                status: client_1.contact_status.new,
            };
        }
        try {
            const adminMail = await this.emailService.send({
                to: mailConfig.contactTo,
                replyTo: dto.email.trim().toLowerCase(),
                subject: 'رسالة تواصل جديدة',
                text: [
                    `الاسم: ${dto.name}`,
                    `البريد الإلكتروني: ${dto.email}`,
                    `النوع: ${this.labelType(dto.type)}`,
                    '',
                    'الرسالة:',
                    dto.message,
                ].join('\n'),
                html: this.buildHtmlBody(dto),
            });
            const userMail = await this.emailService.send({
                to: dto.email.trim().toLowerCase(),
                replyTo: mailConfig.contactTo,
                subject: 'تم استلام رسالتك',
                text: [
                    'شكرًا لتواصلك معنا.',
                    '',
                    'تم استلام رسالتك وسنقوم بالرد عليك في أقرب وقت.',
                    '',
                    'فريق رحال',
                ].join('\n'),
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl;">
            <p>شكرًا لتواصلك معنا.</p>
            <p>تم استلام رسالتك وسنقوم بالرد عليك في أقرب وقت.</p>
            <p>فريق رحال</p>
          </div>
        `,
            });
            const mailErrors = [adminMail.error, userMail.error].filter(Boolean);
            if (mailErrors.length) {
                await this.prisma.contact_messages.update({
                    where: { id: created.id },
                    data: {
                        error_message: mailErrors.join(' | '),
                    },
                });
            }
            return {
                ok: true,
                id: created.id.toString(),
                sent: mailErrors.length === 0,
                status: client_1.contact_status.new,
            };
        }
        catch (error) {
            await this.prisma.contact_messages.update({
                where: { id: created.id },
                data: {
                    error_message: this.emailService.extractError(error),
                },
            });
            return {
                ok: true,
                id: created.id.toString(),
                sent: false,
                status: client_1.contact_status.new,
            };
        }
    }
    async list(query) {
        const status = query.status && query.status !== 'all' ? query.status : undefined;
        const search = query.q?.trim();
        const items = await this.prisma.contact_messages.findMany({
            where: {
                ...(status ? { status } : {}),
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search } },
                            { email: { contains: search } },
                            { message: { contains: search } },
                        ],
                    }
                    : {}),
            },
            orderBy: [{ read_at: 'asc' }, { created_at: 'desc' }],
        });
        return {
            items: items.map((item) => this.toListItem(item)),
            unreadCount: await this.countUnread(),
        };
    }
    async getUnreadCount() {
        return { count: await this.countUnread() };
    }
    async getDetails(id) {
        const record = await this.prisma.contact_messages.findUnique({
            where: { id: BigInt(id) },
        });
        if (!record) {
            throw new common_1.NotFoundException('Contact message not found');
        }
        if (!record.read_at) {
            const updated = await this.prisma.contact_messages.update({
                where: { id: record.id },
                data: {
                    read_at: new Date(),
                },
            });
            return this.toDetailsItem(updated);
        }
        return this.toDetailsItem(record);
    }
    async reply(id, dto) {
        const record = await this.prisma.contact_messages.findUnique({
            where: { id: BigInt(id) },
        });
        if (!record) {
            throw new common_1.NotFoundException('Contact message not found');
        }
        if (!(0, class_validator_1.isEmail)(record.email)) {
            throw new common_1.BadRequestException('Stored email address is invalid');
        }
        const result = await this.emailService.send({
            to: record.email,
            replyTo: this.emailService.getMailConfig()?.contactTo ?? undefined,
            subject: dto.subject,
            text: dto.reply_message,
            html: this.buildReplyHtml(record.name, dto.reply_message),
        });
        if (result.sent) {
            const updated = await this.prisma.contact_messages.update({
                where: { id: record.id },
                data: {
                    status: client_1.contact_status.sent,
                    sent_at: new Date(),
                    read_at: record.read_at ?? new Date(),
                    error_message: null,
                },
            });
            return {
                ok: true,
                message: 'Reply sent successfully',
                item: this.toDetailsItem(updated),
            };
        }
        const updated = await this.prisma.contact_messages.update({
            where: { id: record.id },
            data: {
                status: client_1.contact_status.failed,
                read_at: record.read_at ?? new Date(),
                error_message: result.error || 'Unable to send reply',
            },
        });
        return {
            ok: false,
            message: result.error || 'Unable to send reply',
            item: this.toDetailsItem(updated),
        };
    }
    labelType(value) {
        switch (value) {
            case 'suggestion':
                return 'اقتراح';
            case 'complaint':
                return 'شكوى';
            case 'partnership':
                return 'شراكة';
            default:
                return 'استفسار';
        }
    }
    buildHtmlBody(dto) {
        return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl;">
        <h2 style="margin: 0 0 12px;">رسالة تواصل جديدة</h2>
        <p><strong>الاسم:</strong> ${this.escapeHtml(dto.name)}</p>
        <p><strong>البريد:</strong> ${this.escapeHtml(dto.email)}</p>
        <p><strong>النوع:</strong> ${this.labelType(dto.type)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${this.escapeHtml(dto.message)}</p>
      </div>
    `;
    }
    buildReplyHtml(name, message) {
        return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl;">
        <p>مرحبًا ${this.escapeHtml(name || 'بك')}،</p>
        <p style="white-space: pre-wrap;">${this.escapeHtml(message)}</p>
        <p>فريق رحال</p>
      </div>
    `;
    }
    toListItem(item) {
        return {
            id: item.id.toString(),
            name: item.name,
            email: item.email,
            type: item.type,
            message: item.message,
            status: item.status,
            createdAt: item.created_at,
            readAt: item.read_at,
            sentAt: item.sent_at,
        };
    }
    toDetailsItem(item) {
        return {
            ...this.toListItem(item),
            ipAddress: item.ip_address,
            userAgent: item.user_agent,
            errorMessage: item.error_message,
        };
    }
    countUnread() {
        return this.prisma.contact_messages.count({
            where: {
                read_at: null,
            },
        });
    }
    normalizeIp(value) {
        return this.trimText(value, 64);
    }
    trimText(value, limit = 255) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed.slice(0, limit) : null;
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], ContactService);
//# sourceMappingURL=contact.service.js.map