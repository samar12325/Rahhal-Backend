import { trips_status, trips_type } from '@prisma/client';
export declare class CreateTripDto {
    title: string;
    destination_id: number;
    type: trips_type;
    description?: string;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    price_per_person?: number;
    max_participants?: number;
    status: trips_status;
    created_by: number;
}
