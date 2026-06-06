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
export declare class EmailService {
    private readonly mailerService;
    private readonly config;
    constructor(mailerService: MailerService, config: ConfigService);
    getMailConfig(): {
        user: string;
        pass: string;
        fromName: string;
        contactTo: string | null;
    } | null;
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    send(input: SendEmailInput): Promise<{
        sent: boolean;
        error: string;
    } | {
        sent: boolean;
        error: null;
    }>;
    extractError(error: unknown): string;
    private buildFromHeader;
}
export {};
