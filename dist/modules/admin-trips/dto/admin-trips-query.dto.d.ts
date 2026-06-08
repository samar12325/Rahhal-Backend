import { trips_status, trips_type } from '@prisma/client';
export declare class AdminTripsQueryDto {
    q?: string;
    destinationId?: string;
    type?: trips_type;
    status?: trips_status;
    page?: number;
    limit?: number;
}
