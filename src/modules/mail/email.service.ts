import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
  fromName?: string;
};

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  getMailConfig() {
    const user = this.config.get<string>('MAIL_USER')?.trim();
    const pass = this.config.get<string>('MAIL_PASS')?.trim();
    const fromName =
      this.config.get<string>('MAIL_FROM_NAME')?.trim() || 'RAHHAL';
    const contactTo =
      this.config.get<string>('CONTACT_TO')?.trim() || user || null;

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

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
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

  async send(input: SendEmailInput) {
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
    } catch (error: unknown) {
      return {
        sent: false,
        error: this.extractError(error),
      };
    }
  }

  extractError(error: unknown) {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;

    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    return 'Unknown error';
  }

  private buildFromHeader(fromName: string) {
    const user = this.config.get<string>('MAIL_USER')?.trim();
    return user ? `"${fromName}" <${user}>` : undefined;
  }
}
