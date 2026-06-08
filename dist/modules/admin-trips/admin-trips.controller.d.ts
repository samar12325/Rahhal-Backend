import { AdminTripsService } from './admin-trips.service';
import { AdminTripsQueryDto } from './dto/admin-trips-query.dto';
import { CreateAdminTripDto } from './dto/create-admin-trip.dto';
import { UpdateAdminTripDto } from './dto/update-admin-trip.dto';
export declare class AdminTripsController {
    private readonly adminTripsService;
    constructor(adminTripsService: AdminTripsService);
    list(query: AdminTripsQueryDto): Promise<{
        summary: {
            totalTrips: number;
            avgPrice: number | null;
            citiesCount: number;
            availableSeats: number;
            avgRating: null;
            resultsCount: number;
        };
        items: {
            id: string;
            destination_id: string;
            title: string;
            type: import(".prisma/client").$Enums.trips_type;
            status: import(".prisma/client").$Enums.trips_status;
            price_per_person: number | null;
            old_price: number | null;
            description: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            max_participants: number | null;
            image_url: string | null;
            display_image_url: string;
            includes: import("@prisma/client/runtime/library").JsonArray | null;
            destination: {
                id: string;
                name: string;
                region: import(".prisma/client").$Enums.destinations_region;
                image_url: string | null;
            } | null;
            created_at: string;
        }[];
    }>;
    create(dto: CreateAdminTripDto): Promise<{
        id: string;
        destination_id: string;
        title: string;
        type: import(".prisma/client").$Enums.trips_type;
        status: import(".prisma/client").$Enums.trips_status;
        price_per_person: number | null;
        old_price: number | null;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        max_participants: number | null;
        image_url: string | null;
        display_image_url: string;
        includes: import("@prisma/client/runtime/library").JsonArray | null;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            image_url: string | null;
        } | null;
        created_at: string;
    }>;
    update(id: number, dto: UpdateAdminTripDto): Promise<{
        id: string;
        destination_id: string;
        title: string;
        type: import(".prisma/client").$Enums.trips_type;
        status: import(".prisma/client").$Enums.trips_status;
        price_per_person: number | null;
        old_price: number | null;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        max_participants: number | null;
        image_url: string | null;
        display_image_url: string;
        includes: import("@prisma/client/runtime/library").JsonArray | null;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            image_url: string | null;
        } | null;
        created_at: string;
    }>;
    delete(id: number): Promise<{
        ok: boolean;
        deleted: boolean;
        status?: undefined;
    } | {
        ok: boolean;
        deleted: boolean;
        status: string;
    }>;
}
