import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    updateMe(userId: string, dto: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    getMyBookings(userId: string): Promise<{
        items: {
            id: string;
            tripId: string;
            date: string | null;
            time: string | null;
            people: number;
            status: string;
            hasEnded: boolean;
            canReview: boolean;
            trip: {
                id: string;
                title: string;
                city: string;
                image: string;
                type: import(".prisma/client").$Enums.trips_type;
            } | null;
            review: {
                rating: number;
                comment: string | null;
            } | null;
        }[];
    }>;
    private mapBooking;
}
