import { event_status } from '@prisma/client';
export declare class ListEventsDto {
    q?: string;
    city?: string;
    category?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean;
    status?: event_status;
}
