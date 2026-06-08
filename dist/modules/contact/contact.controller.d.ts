import type { Request } from 'express';
import { ContactService } from './contact.service';
import { AdminContactMessagesQueryDto } from './dto/admin-contact-messages-query.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactDto, req: Request): Promise<{
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
    unreadCount(): Promise<{
        count: number;
    }>;
    details(id: number): Promise<{
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
}
