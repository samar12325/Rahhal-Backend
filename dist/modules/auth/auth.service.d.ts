import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../mail/email.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private emailService;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, emailService: EmailService);
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
    forgotPassword(dto: {
        email: string;
    }): Promise<{
        ok: boolean;
        debug: {
            userFound: boolean;
            mailAttempted: boolean;
            mailSent: boolean;
        };
    } | {
        ok: boolean;
        debug?: undefined;
    }>;
    resetPassword(dto: {
        token: string;
        password: string;
    }): Promise<{
        ok: boolean;
    }>;
    private getResetTokenSecret;
    private createResetToken;
    private verifyResetToken;
    private hashResetMarker;
    private getFrontendUrl;
    private extractMailError;
}
