import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
    const refreshDays =
      this.config.get<number>('REFRESH_EXPIRES_IN_DAYS') ?? 7;
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
}
