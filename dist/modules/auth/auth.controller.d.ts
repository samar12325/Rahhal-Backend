import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { Response } from 'express';
import type { RequestWithAuthCookies } from '../../common/types/authenticated-request.type';
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
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(req: RequestWithAuthCookies, res: Response): Promise<{
        ok: boolean;
        accessToken: string;
    }>;
    logout(res: Response): {
        ok: boolean;
    };
    forgotPassword(dto: ForgotPasswordDto): Promise<{
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
    resetPassword(dto: ResetPasswordDto): Promise<{
        ok: boolean;
    }>;
    private setAuthCookies;
    private setAccessCookie;
    private cookieOptions;
}
