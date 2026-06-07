import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { contact_messages, contact_status } from '@prisma/client';
import { isEmail } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { AdminContactMessagesQueryDto } from './dto/admin-contact-messages-query.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';

type ContactRequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateContactDto, meta: ContactRequestMeta = {}) {
    const created = await this.prisma.contact_messages.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        type: dto.type,
        message: dto.message.trim(),
        status: contact_status.new,
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
        status: contact_status.new,
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
        status: contact_status.new,
      };
    } catch (error: unknown) {
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
        status: contact_status.new,
      };
    }
  }

  async list(query: AdminContactMessagesQueryDto) {
    const status =
      query.status && query.status !== 'all' ? query.status : undefined;
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

  async getDetails(id: number) {
    const record = await this.prisma.contact_messages.findUnique({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundException('Contact message not found');
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

  async reply(id: number, dto: ReplyContactMessageDto) {
    const record = await this.prisma.contact_messages.findUnique({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundException('Contact message not found');
    }

    if (!isEmail(record.email)) {
      throw new BadRequestException('Stored email address is invalid');
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
          status: contact_status.sent,
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
        status: contact_status.failed,
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

  private labelType(value: string) {
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

  private buildHtmlBody(dto: CreateContactDto) {
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

  private buildReplyHtml(name: string, message: string) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl;">
        <p>مرحبًا ${this.escapeHtml(name || 'بك')}،</p>
        <p style="white-space: pre-wrap;">${this.escapeHtml(message)}</p>
        <p>فريق رحال</p>
      </div>
    `;
  }

  private toListItem(item: contact_messages) {
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

  private toDetailsItem(item: contact_messages) {
    return {
      ...this.toListItem(item),
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      errorMessage: item.error_message,
    };
  }

  private countUnread() {
    return this.prisma.contact_messages.count({
      where: {
        read_at: null,
      },
    });
  }

  private normalizeIp(value?: string | null) {
    return this.trimText(value, 64);
  }

  private trimText(value?: string | null, limit = 255) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, limit) : null;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
