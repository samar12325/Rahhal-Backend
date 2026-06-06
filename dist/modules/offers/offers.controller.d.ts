import { ListOffersDto } from './dto/list-offers.dto';
import { OffersService } from './offers.service';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
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
}
