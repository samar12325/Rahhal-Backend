import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    me(req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    } | null>;
    update(req: AuthenticatedRequest, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    myBookings(req: AuthenticatedRequest): Promise<{
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
}
