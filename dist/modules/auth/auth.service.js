"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../mail/email.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    emailService;
    constructor(prisma, jwt, config, emailService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.emailService = emailService;
    }
    normalizeUser(user) {
        return {
            ...user,
            id: user.id.toString(),
        };
    }
    async signAccessToken(user) {
        return this.jwt.signAsync({
            sub: user.id.toString(),
            role: user.role,
        });
    }
    async signRefreshToken(user) {
        const secret = this.config.get('JWT_REFRESH_SECRET');
        const refreshDays = this.config.get('REFRESH_EXPIRES_IN_DAYS') ?? 7;
        const expiresIn = `${refreshDays}d`;
        return this.jwt.signAsync({ sub: user.id.toString(), role: user.role }, { secret, expiresIn });
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hash,
                phone: dto.phone ?? null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        const accessToken = await this.signAccessToken(user);
        const refreshToken = await this.signRefreshToken(user);
        return {
            user: this.normalizeUser(user),
            accessToken,
            refreshToken,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.signAccessToken(user);
        const refreshToken = await this.signRefreshToken(user);
        return {
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }
    async refresh(refreshToken) {
        try {
            const secret = this.config.get('JWT_REFRESH_SECRET');
            const payload = await this.jwt.verifyAsync(refreshToken, { secret });
            const accessToken = await this.jwt.signAsync({
                sub: payload.sub,
                role: payload.role,
            });
            return { accessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async forgotPassword(dto) {
        const debugEnabled = this.config.get('DEBUG_FORGOT_PASSWORD') === 'true';
        const debugState = {
            userFound: false,
            mailAttempted: false,
            mailSent: false,
        };
        console.log('FORGOT PASSWORD STARTED');
        const email = dto.email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        debugState.userFound = !!user;
        console.log('USER FOUND:', debugState.userFound);
        if (!user) {
            return debugEnabled ? { ok: true, debug: debugState } : { ok: true };
        }
        if (!this.emailService.getMailConfig()) {
            throw new common_1.InternalServerErrorException('Mail not configured');
        }
        console.log('MAIL USER EXISTS:', !!process.env.MAIL_USER);
        console.log('MAIL USER:', process.env.MAIL_USER);
        const resetToken = await this.createResetToken(user);
        console.log('RESET TOKEN GENERATED');
        const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
        try {
            console.log('ATTEMPTING TO SEND EMAIL...');
            debugState.mailAttempted = true;
            const text = [
                'Reset your password using this link:',
                resetUrl,
                '',
                'If you did not request this, ignore this email.',
            ].join('\n');
            console.log('MAIL TO:', user.email);
            console.log('MAIL SUBJECT:', 'Reset Password');
            console.log('MAIL PAYLOAD:', {
                to: user.email,
                subject: 'Reset Password',
                text: text.replace(resetToken, '***'),
            });
            const result = await this.emailService.send({
                to: user.email,
                subject: 'Reset Password',
                text,
                html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset Password</h2>
            <p>Reset your password using this link:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
            });
            if (!result.sent) {
                throw new Error(result.error || 'Unable to send reset email');
            }
            console.log('EMAIL SENT SUCCESSFULLY');
            debugState.mailSent = true;
        }
        catch (error) {
            console.error('MAIL ERROR:', error);
            throw new common_1.InternalServerErrorException(this.extractMailError(error));
        }
        return debugEnabled ? { ok: true, debug: debugState } : { ok: true };
    }
    async resetPassword(dto) {
        console.log('RESET PASSWORD STARTED');
        const secret = this.getResetTokenSecret();
        const payload = await this.verifyResetToken(dto.token, secret);
        let userId;
        try {
            userId = BigInt(payload.sub);
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.email !== payload.email) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const expectedMarker = this.hashResetMarker(user.passwordHash, secret);
        if (payload.ph !== expectedMarker) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const newHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });
        console.log('PASSWORD RESET COMPLETED');
        return { ok: true };
    }
    getResetTokenSecret() {
        const secret = this.config.get('RESET_TOKEN_PEPPER');
        if (!secret) {
            throw new common_1.InternalServerErrorException('Reset token secret missing');
        }
        return secret;
    }
    async createResetToken(user) {
        const secret = this.getResetTokenSecret();
        const marker = this.hashResetMarker(user.passwordHash, secret);
        return this.jwt.signAsync({ sub: user.id.toString(), email: user.email, ph: marker }, { secret, expiresIn: '15m' });
    }
    async verifyResetToken(token, secret) {
        try {
            return await this.jwt.verifyAsync(token, { secret });
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
    }
    hashResetMarker(passwordHash, secret) {
        return (0, crypto_1.createHash)('sha256')
            .update(`${passwordHash}${secret}`)
            .digest('hex');
    }
    getFrontendUrl() {
        return this.config.get('FRONTEND_URL') ?? 'http://localhost:5173';
    }
    extractMailError(error) {
        if (!error)
            return 'Unable to send reset email';
        if (typeof error === 'string')
            return error;
        if (error instanceof Error && error.message.trim()) {
            return error.message.trim();
        }
        return 'Unable to send reset email';
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map