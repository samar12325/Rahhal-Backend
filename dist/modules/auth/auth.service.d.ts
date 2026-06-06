import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    private normalizeUser;
    private signAccessToken;
    private signRefreshToken;
    register(dto: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt?: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
