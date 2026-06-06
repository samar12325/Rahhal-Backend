import { PrismaService } from '../../prisma/prisma.service';
import { ListOffersDto } from './dto/list-offers.dto';
export declare class OffersService {
    private prisma;
    constructor(prisma: PrismaService);
    list(query: ListOffersDto): Promise<{
        count: number;
        offers: {
            id: string;
            title: string;
            destination: string;
            region: string;
            duration: string;
            includes: string[];
            oldPrice: number | null;
            newPrice: number | null;
            discountPercent: number;
            rating: number;
            tags: string[];
            availability: string;
            image: string;
            destination_id: string;
        }[];
    }>;
    getById(id: number): Promise<{
        id: string;
        title: string;
        destination: string;
        region: string;
        duration: string;
        includes: string[];
        oldPrice: number | null;
        newPrice: number | null;
        discountPercent: number;
        rating: number;
        tags: string[];
        availability: string;
        image: string;
        destination_id: string;
    }>;
    private buildWhere;
    private hasOffers;
    private mapOffer;
    private normalizeRegion;
    private toArabicRegion;
    private formatDuration;
    private calculateDurationDays;
    private extractIncludes;
    private normalizeTags;
    private tagCandidates;
    private loadRatings;
    private applySort;
}
