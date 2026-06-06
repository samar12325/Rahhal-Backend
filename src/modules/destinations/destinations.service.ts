import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DestinationsService {
  constructor(private prisma: PrismaService) {}

  async list(region?: string) {
    const where: Record<string, unknown> = { is_active: true };

    if (region && region !== 'all') {
      where.region = region;
    }

    const items = await this.prisma.destinations.findMany({
      where,
      orderBy: [{ created_at: 'desc' }],
      select: {
        id: true,
        name: true,
        region: true,
        description: true,
        image_url: true,
      },
    });

    return items.map((destination) => ({
      ...destination,
      id: destination.id.toString(),
    }));
  }

  async getById(id: string) {
    if (!/^\d+$/.test(id)) {
      return null;
    }

    const destination = await this.prisma.destinations.findFirst({
      where: {
        id: BigInt(id),
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        region: true,
        description: true,
        image_url: true,
      },
    });

    if (!destination) {
      return null;
    }

    return {
      ...destination,
      id: destination.id.toString(),
    };
  }
}
