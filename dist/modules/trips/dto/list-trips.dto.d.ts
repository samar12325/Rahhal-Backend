import { destinations_region, trips_status, trips_type } from '@prisma/client';
export declare class ListTripsDto {
    region?: destinations_region;
    type?: trips_type;
    status?: trips_status;
    minPrice?: string;
    maxPrice?: string;
    duration?: string;
    q?: string;
    destinationId?: string;
}
