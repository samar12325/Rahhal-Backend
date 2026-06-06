import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ListTripsDto } from './dto/list-trips.dto';
export declare class TripsService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapTrip;
    list(q: ListTripsDto): Promise<{
        count: number;
        trips: {
            id: string;
            title: string;
            destination_id: string;
            type: string;
            description: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            price_per_person: string | null;
            max_participants: number | null;
            status: string;
            created_by: string;
            created_at: Date;
            updated_at: Date | null;
            destination: {
                id: string;
                name: string;
                region: string;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | undefined;
        }[];
    }>;
    getById(id: number): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: string;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: string;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        destination: {
            id: string;
            name: string;
            region: string;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
    }>;
    create(dto: CreateTripDto): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: string;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: string;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        destination: {
            id: string;
            name: string;
            region: string;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
    }>;
}
