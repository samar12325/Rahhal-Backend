import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    me(req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        phone: string | null;
        createdAt: Date;
    } | null>;
    update(req: any, dto: UpdateProfileDto): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        phone: string | null;
        createdAt: Date;
    }>;
}
