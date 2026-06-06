import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { AdminContactMessagesQueryDto } from './dto/admin-contact-messages-query.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
type ContactRequestMeta = {
    ipAddress?: string | null;
    userAgent?: string | null;
};
export declare class ContactService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    create(dto: CreateContactDto, meta?: ContactRequestMeta): Promise<{
        ok: boolean;
        id: string;
        sent: boolean;
        status: "new";
    }>;
    list(query: AdminContactMessagesQueryDto): Promise<{
        items: {
            id: string;
            name: string;
            email: string;
            type: import(".prisma/client").$Enums.contact_type;
            message: string;
            status: import(".prisma/client").$Enums.contact_status;
            createdAt: Date;
            readAt: Date | null;
            sentAt: Date | null;
        }[];
        unreadCount: number;
    }>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    getDetails(id: number): Promise<{
        ipAddress: string | null;
        userAgent: string | null;
        errorMessage: string | null;
        id: string;
        name: string;
        email: string;
        type: import(".prisma/client").$Enums.contact_type;
        message: string;
        status: import(".prisma/client").$Enums.contact_status;
        createdAt: Date;
        readAt: Date | null;
        sentAt: Date | null;
    }>;
    reply(id: number, dto: ReplyContactMessageDto): Promise<{
        ok: boolean;
        message: string;
        item: {
            ipAddress: string | null;
            userAgent: string | null;
            errorMessage: string | null;
            id: string;
            name: string;
            email: string;
            type: import(".prisma/client").$Enums.contact_type;
            message: string;
            status: import(".prisma/client").$Enums.contact_status;
            createdAt: Date;
            readAt: Date | null;
            sentAt: Date | null;
        };
    }>;
    private labelType;
    private buildHtmlBody;
    private buildReplyHtml;
    private toListItem;
    private toDetailsItem;
    private countUnread;
    private normalizeIp;
    private trimText;
    private escapeHtml;
}
export {};
