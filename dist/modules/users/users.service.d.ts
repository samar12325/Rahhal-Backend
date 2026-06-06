import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        phone: string | null;
        createdAt: Date;
    } | null>;
    updateMe(userId: string, dto: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        phone: string | null;
        createdAt: Date;
    }>;
}
