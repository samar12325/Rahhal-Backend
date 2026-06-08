"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    async register(dto, res) {
        const result = await this.auth.register(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }
    async login(dto, res) {
        const result = await this.auth.login(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }
    async refresh(req, res) {
        const token = req.cookies?.refreshToken;
        if (typeof token !== 'string' || token.length === 0) {
            res.clearCookie('accessToken', this.cookieOptions());
            res.clearCookie('refreshToken', this.cookieOptions());
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        try {
            const result = await this.auth.refresh(token);
            this.setAccessCookie(res, result.accessToken);
            return {
                ok: true,
                accessToken: result.accessToken,
            };
        }
        catch (error) {
            res.clearCookie('accessToken', this.cookieOptions());
            res.clearCookie('refreshToken', this.cookieOptions());
            throw error;
        }
    }
    logout(res) {
        res.clearCookie('accessToken', this.cookieOptions());
        res.clearCookie('refreshToken', this.cookieOptions());
        return { ok: true };
    }
    forgotPassword(dto) {
        return this.auth.forgotPassword(dto);
    }
    resetPassword(dto) {
        return this.auth.resetPassword(dto);
    }
    setAuthCookies(res, accessToken, refreshToken) {
        this.setAccessCookie(res, accessToken);
        const refreshDays = parseInt(process.env.REFRESH_EXPIRES_IN_DAYS ?? '7', 10) || 7;
        res.cookie('refreshToken', refreshToken, {
            ...this.cookieOptions(),
            maxAge: refreshDays * 24 * 60 * 60 * 1000,
        });
    }
    setAccessCookie(res, accessToken) {
        res.cookie('accessToken', accessToken, {
            ...this.cookieOptions(),
            maxAge: 15 * 60 * 1000,
        });
    }
    cookieOptions() {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map