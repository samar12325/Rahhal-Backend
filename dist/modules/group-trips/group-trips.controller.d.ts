import type { Request } from 'express';
import { CreateGroupTripDto } from './dto/create-group-trip.dto';
import { ListGroupTripsDto } from './dto/list-group-trips.dto';
import { GroupTripsService } from './group-trips.service';
export declare class GroupTripsController {
    private readonly service;
    constructor(service: GroupTripsService);
    private getApiBaseUrl;
    private buildPublicUrl;
    private getDefaultImageUrl;
    list(q: ListGroupTripsDto): Promise<{
        count: number;
        trips: {
            id: string;
            title: string;
            destination_id: string;
            type: import(".prisma/client").$Enums.trips_type;
            description: string | null;
            image_url: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            price_per_person: string | null;
            max_participants: number | null;
            status: import(".prisma/client").$Enums.trips_status;
            created_by: string;
            created_at: Date;
            updated_at: Date | null;
            current_participants: number;
            capacity: number;
            is_past: boolean;
            can_join: boolean;
            destination: {
                id: string;
                name: string;
                region: import(".prisma/client").$Enums.destinations_region;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | undefined;
            group_details: {
                trip_id: string;
                required_participants: number;
                organizer_id: string;
                join_deadline: string | null;
                notes: string | null;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        }[];
    }>;
    listAvailable(q: ListGroupTripsDto): Promise<{
        count: number;
        trips: {
            id: string;
            title: string;
            destination_id: string;
            type: import(".prisma/client").$Enums.trips_type;
            description: string | null;
            image_url: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            price_per_person: string | null;
            max_participants: number | null;
            status: import(".prisma/client").$Enums.trips_status;
            created_by: string;
            created_at: Date;
            updated_at: Date | null;
            current_participants: number;
            capacity: number;
            is_past: boolean;
            can_join: boolean;
            destination: {
                id: string;
                name: string;
                region: import(".prisma/client").$Enums.destinations_region;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | undefined;
            group_details: {
                trip_id: string;
                required_participants: number;
                organizer_id: string;
                join_deadline: string | null;
                notes: string | null;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        }[];
    }>;
    listPast(q: ListGroupTripsDto): Promise<{
        count: number;
        trips: {
            id: string;
            title: string;
            destination_id: string;
            type: import(".prisma/client").$Enums.trips_type;
            description: string | null;
            image_url: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            price_per_person: string | null;
            max_participants: number | null;
            status: import(".prisma/client").$Enums.trips_status;
            created_by: string;
            created_at: Date;
            updated_at: Date | null;
            current_participants: number;
            capacity: number;
            is_past: boolean;
            can_join: boolean;
            destination: {
                id: string;
                name: string;
                region: import(".prisma/client").$Enums.destinations_region;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | undefined;
            group_details: {
                trip_id: string;
                required_participants: number;
                organizer_id: string;
                join_deadline: string | null;
                notes: string | null;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        }[];
    }>;
    getById(id: number): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: import(".prisma/client").$Enums.trips_type;
        description: string | null;
        image_url: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: import(".prisma/client").$Enums.trips_status;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        current_participants: number;
        capacity: number;
        is_past: boolean;
        can_join: boolean;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
        group_details: {
            trip_id: string;
            required_participants: number;
            organizer_id: string;
            join_deadline: string | null;
            notes: string | null;
            created_at: Date;
            updated_at: Date | null;
        } | null;
    }>;
    getParticipants(id: number, req?: Request & {
        user?: {
            userId?: string | number;
            role?: string;
        };
    }): Promise<{
        tripId: string;
        tripTitle: string;
        viewer_role: string;
        participants: ({
            booking_id: string;
            user_id: string;
            name: string;
            email: string;
            persons_count: number;
            status: string;
            raw_status: import(".prisma/client").$Enums.bookings_status;
        } | {
            booking_id: string;
            name: string;
            persons_count: number;
            user_id?: undefined;
            email?: undefined;
            status?: undefined;
            raw_status?: undefined;
        })[];
    }>;
    create(dto: CreateGroupTripDto, file?: Express.Multer.File, req?: Request & {
        user?: {
            userId?: string | number;
        };
    }): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: import(".prisma/client").$Enums.trips_type;
        description: string | null;
        image_url: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: import(".prisma/client").$Enums.trips_status;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        current_participants: number;
        capacity: number;
        is_past: boolean;
        can_join: boolean;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
        group_details: {
            trip_id: string;
            required_participants: number;
            organizer_id: string;
            join_deadline: string | null;
            notes: string | null;
            created_at: Date;
            updated_at: Date | null;
        } | null;
    }>;
}
