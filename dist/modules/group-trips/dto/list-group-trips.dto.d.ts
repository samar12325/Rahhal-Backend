import { trips_status } from '@prisma/client';
export declare class ListGroupTripsDto {
    status?: trips_status;
    createdBy?: string;
    destinationId?: string;
    q?: string;
}
