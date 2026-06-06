import { DestinationsService } from './destinations.service';
export declare class DestinationsController {
    private service;
    constructor(service: DestinationsService);
    list(region?: string): Promise<{
        id: string;
        name: string;
        region: import(".prisma/client").$Enums.destinations_region;
        description: string | null;
        image_url: string | null;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        name: string;
        region: import(".prisma/client").$Enums.destinations_region;
        description: string | null;
        image_url: string | null;
    }>;
}
