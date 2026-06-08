import { trips_status, trips_type } from '@prisma/client';
export declare class UpdateAdminTripDto {
    title?: string;
    destination_id?: number;
    type?: trips_type;
    description?: string;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    price_per_person?: number;
    old_price?: number;
    max_participants?: number;
    status?: trips_status;
    image_url?: string;
    includes?: string[];
}
