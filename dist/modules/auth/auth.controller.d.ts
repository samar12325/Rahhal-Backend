import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt?: Date;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: null;
        ok?: undefined;
    } | {
        ok: boolean;
        accessToken?: undefined;
    }>;
    logout(res: Response): {
        ok: boolean;
    };
    private setAuthCookies;
    private setAccessCookie;
    private cookieOptions;
}
