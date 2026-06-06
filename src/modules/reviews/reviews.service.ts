import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async list(limit = 6) {
    const items = await this.prisma.reviews.findMany({
      take: Math.min(Number(limit) || 6, 20),
      orderBy: { created_at: 'desc' },
      where: {
        comment: { not: null },
      },
      select: {
        id: true,
        user_id: true,
        rating: true,
        comment: true,
        created_at: true,
      },
    });

    return {
      items: items.map((review) => ({
        id: review.id.toString(),
        userId: review.user_id.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      })),
    };
  }

  async create(userId: string, dto: { bookingId: number; rating: number; comment?: string }) {
    const uid = BigInt(userId);
    const bookingId = BigInt(dto.bookingId);

    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      select: { id: true, user_id: true },
    });

    if (!booking) throw new BadRequestException('Booking not found');
    if (booking.user_id !== uid) throw new UnauthorizedException('Not your booking');

    const exists = await this.prisma.reviews.findFirst({
      where: { booking_id: bookingId },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('Already reviewed');

    const created = await this.prisma.reviews.create({
      data: {
        booking_id: bookingId,
        user_id: uid,
        rating: dto.rating,
        comment: dto.comment ?? null,
        created_at: new Date(),
      },
      select: {
        id: true,
        user_id: true,
        rating: true,
        comment: true,
        created_at: true,
      },
    });

    return {
      id: created.id.toString(),
      userId: created.user_id.toString(),
      rating: created.rating,
      comment: created.comment,
      createdAt: created.created_at,
    };
  }
}
