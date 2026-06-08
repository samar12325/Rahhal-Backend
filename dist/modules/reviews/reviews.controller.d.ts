import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private service;
    constructor(service: ReviewsService);
    list(limit: string): Promise<{
        items: {
            id: string;
            userId: string;
            rating: number;
            comment: string | null;
            createdAt: Date;
        }[];
    }>;
    create(req: AuthenticatedRequest, dto: CreateReviewDto): Promise<{
        id: string;
        userId: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
    }>;
}
