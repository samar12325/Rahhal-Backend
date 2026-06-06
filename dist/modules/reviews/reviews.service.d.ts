import { PrismaService } from '../../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(limit?: number): Promise<{
        items: {
            id: string;
            userId: string;
            rating: number;
            comment: string | null;
            createdAt: Date;
        }[];
    }>;
    create(userId: string, dto: {
        bookingId: number;
        rating: number;
        comment?: string;
    }): Promise<{
        id: string;
        userId: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
    }>;
}
