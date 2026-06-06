import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const id = BigInt(userId);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      id: user.id.toString(),
    };
  }

  async updateMe(
    userId: string,
    dto: { name?: string; email?: string; phone?: string },
  ) {
    const id = BigInt(userId);

    const email = dto.email?.trim().toLowerCase();

    if (email) {
      const exists = await this.prisma.user.findUnique({ where: { email } });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        email,
        phone: dto.phone ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return { ...updated, id: updated.id.toString() };
  }
}
