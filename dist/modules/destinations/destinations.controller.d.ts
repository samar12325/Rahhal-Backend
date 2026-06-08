import { DestinationsService } from './destinations.service';
export declare class DestinationsController {
    private service;
    constructor(service: DestinationsService);
    list(region?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        image_url: string | null;
        region: import(".prisma/client").$Enums.destinations_region;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        image_url: string | null;
        region: import(".prisma/client").$Enums.destinations_region;
    }>;
}
