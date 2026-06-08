import { PrismaService } from '../../prisma/prisma.service';
export declare class DestinationsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    } | null>;
}
