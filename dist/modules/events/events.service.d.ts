import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: ListEventsDto, adminView?: boolean): Promise<{
        count: number;
        events: {
            id: string;
            title: string;
            city: string;
            location: string;
            category: string;
            description: string | null;
            image_url: string | null;
            display_image_url: string;
            price_text: string | null;
            start_datetime: string;
            end_datetime: string | null;
            official_booking_url: string | null;
            status: import(".prisma/client").$Enums.event_status;
            created_at: string;
            updated_at: string | null;
        }[];
        summary?: undefined;
        items?: undefined;
    } | {
        summary: {
            totalEvents: number;
            activeEvents: number;
            categoriesCount: number;
            citiesCount: number;
            resultsCount: number;
        };
        items: {
            id: string;
            title: string;
            city: string;
            location: string;
            category: string;
            description: string | null;
            image_url: string | null;
            display_image_url: string;
            price_text: string | null;
            start_datetime: string;
            end_datetime: string | null;
            official_booking_url: string | null;
            status: import(".prisma/client").$Enums.event_status;
            created_at: string;
            updated_at: string | null;
        }[];
        count?: undefined;
        events?: undefined;
    }>;
    getById(id: number, adminView?: boolean): Promise<{
        id: string;
        title: string;
        city: string;
        location: string;
        category: string;
        description: string | null;
        image_url: string | null;
        display_image_url: string;
        price_text: string | null;
        start_datetime: string;
        end_datetime: string | null;
        official_booking_url: string | null;
        status: import(".prisma/client").$Enums.event_status;
        created_at: string;
        updated_at: string | null;
    }>;
    create(dto: CreateEventDto): Promise<{
        id: string;
        title: string;
        city: string;
        location: string;
        category: string;
        description: string | null;
        image_url: string | null;
        display_image_url: string;
        price_text: string | null;
        start_datetime: string;
        end_datetime: string | null;
        official_booking_url: string | null;
        status: import(".prisma/client").$Enums.event_status;
        created_at: string;
        updated_at: string | null;
    }>;
    update(id: number, dto: UpdateEventDto): Promise<{
        id: string;
        title: string;
        city: string;
        location: string;
        category: string;
        description: string | null;
        image_url: string | null;
        display_image_url: string;
        price_text: string | null;
        start_datetime: string;
        end_datetime: string | null;
        official_booking_url: string | null;
        status: import(".prisma/client").$Enums.event_status;
        created_at: string;
        updated_at: string | null;
    }>;
    remove(id: number, dto: DeleteEventDto): Promise<{
        ok: boolean;
        deleted: boolean;
        status?: undefined;
    } | {
        ok: boolean;
        deleted: boolean;
        status: "inactive";
    }>;
    private buildWhere;
    private ensureDateRange;
    private mapEvent;
}
