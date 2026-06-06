import { event_status } from '@prisma/client';
export declare class UpdateEventDto {
    title?: string;
    city?: string;
    location?: string;
    category?: string;
    description?: string;
    image_url?: string;
    price_text?: string;
    start_datetime?: string;
    end_datetime?: string;
    official_booking_url?: string;
    status?: event_status;
}
