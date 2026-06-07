import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../mail/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  private normalizeUser(user: {
    id: bigint;
    name: string;
    email: string;
    role: string;
    createdAt?: Date;
  }) {
    return {
      ...user,
      id: user.id.toString(),
    };
  }

  private async signAccessToken(user: { id: bigint; role: string }) {
    return this.jwt.signAsync({
      sub: user.id.toString(),
      role: user.role,
    });
  }

  private async signRefreshToken(user: { id: bigint; role: string }) {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshDays = this.config.get<number>('REFRESH_EXPIRES_IN_DAYS') ?? 7;
    const expiresIn = `${refreshDays}d` as import('ms').StringValue;

    return this.jwt.signAsync(
      { sub: user.id.toString(), role: user.role },
      { secret, expiresIn },
    );
  }

  async register(dto: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Email already exists');
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

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
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

  async refresh(refreshToken: string) {
    try {
      const secret = this.config.get<string>('JWT_REFRESH_SECRET');
      const payload = await this.jwt.verifyAsync<{ sub: string; role: string }>(
        refreshToken,
        { secret },
      );

      const accessToken = await this.jwt.signAsync({
        sub: payload.sub,
        role: payload.role,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(dto: { email: string }) {
    const debugEnabled =
      this.config.get<string>('DEBUG_FORGOT_PASSWORD') === 'true';
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
      throw new InternalServerErrorException('Mail not configured');
    }

    console.log('MAIL USER EXISTS:', !!process.env.MAIL_USER);
    console.log('MAIL USER:', process.env.MAIL_USER);

    const resetToken = await this.createResetToken(user);
    console.log('RESET TOKEN GENERATED');
    const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${encodeURIComponent(
      resetToken,
    )}`;

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
    } catch (error: unknown) {
      console.error('MAIL ERROR:', error);
      throw new InternalServerErrorException(this.extractMailError(error));
    }

    return debugEnabled ? { ok: true, debug: debugState } : { ok: true };
  }

  async resetPassword(dto: { token: string; password: string }) {
    console.log('RESET PASSWORD STARTED');
    const secret = this.getResetTokenSecret();
    const payload = await this.verifyResetToken(dto.token, secret);

    let userId: bigint;
    try {
      userId = BigInt(payload.sub);
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== payload.email) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const expectedMarker = this.hashResetMarker(user.passwordHash, secret);
    if (payload.ph !== expectedMarker) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    console.log('PASSWORD RESET COMPLETED');
    return { ok: true };
  }

  private getResetTokenSecret() {
    const secret = this.config.get<string>('RESET_TOKEN_PEPPER');
    if (!secret) {
      throw new InternalServerErrorException('Reset token secret missing');
    }
    return secret;
  }

  private async createResetToken(user: {
    id: bigint;
    email: string;
    passwordHash: string;
  }) {
    const secret = this.getResetTokenSecret();
    const marker = this.hashResetMarker(user.passwordHash, secret);
    return this.jwt.signAsync(
      { sub: user.id.toString(), email: user.email, ph: marker },
      { secret, expiresIn: '15m' as import('ms').StringValue },
    );
  }

  private async verifyResetToken(token: string, secret: string) {
    try {
      return await this.jwt.verifyAsync<{
        sub: string;
        email: string;
        ph: string;
      }>(token, { secret });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private hashResetMarker(passwordHash: string, secret: string) {
    return createHash('sha256')
      .update(`${passwordHash}${secret}`)
      .digest('hex');
  }

  private getFrontendUrl() {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  }

  private extractMailError(error: unknown) {
    if (!error) return 'Unable to send reset email';
    if (typeof error === 'string') return error;

    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    return 'Unable to send reset email';
  }
}
