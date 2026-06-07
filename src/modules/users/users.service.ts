import { BadRequestException, Injectable } from '@nestjs/common';
import { bookings_status, Prisma } from '@prisma/client';
import { isBookingCompletedByDate } from '../../common/utils/booking-completion';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_TRIP_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Trip';

type BookingPayload = Prisma.bookingsGetPayload<{
  include: {
    trips: {
      include: {
        destinations: true;
      };
    };
    reviews: true;
  };
}> & {
  scheduled_time?: string | null;
};

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

  async getMyBookings(userId: string) {
    const id = BigInt(userId);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        user_id: id,
        status: {
          in: [
            bookings_status.pending,
            bookings_status.confirmed,
            bookings_status.completed,
          ],
        },
      },
      include: {
        trips: {
          include: {
            destinations: true,
          },
        },
        reviews: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      items: bookings.map((booking) => this.mapBooking(booking)),
    };
  }

  private mapBooking(booking: BookingPayload) {
    const trip = booking.trips;
    const destination = trip?.destinations;

    const date = booking.scheduled_date ?? trip?.start_date ?? null;

    const image =
      trip?.image_url ?? destination?.image_url ?? DEFAULT_TRIP_IMAGE;

    const hasEnded =
      isBookingCompletedByDate({
        scheduledDate: booking.scheduled_date,
        scheduledTime: booking.scheduled_time,
        tripStartDate: trip?.start_date,
        tripEndDate: trip?.end_date,
      }) || booking.status === bookings_status.completed;
    const status = hasEnded ? 'completed' : 'upcoming';

    return {
      id: booking.id.toString(),
      tripId: booking.trip_id.toString(),
      date: date ? date.toISOString().slice(0, 10) : null,
      time: booking.scheduled_time ?? null,
      people: booking.persons_count,
      status,
      hasEnded,
      canReview: hasEnded && !booking.reviews,
      trip: trip
        ? {
            id: trip.id.toString(),
            title: trip.title,
            city: destination?.name ?? '',
            image,
            type: trip.type,
          }
        : null,
      review: booking.reviews
        ? {
            rating: booking.reviews.rating,
            comment: booking.reviews.comment,
          }
        : null,
    };
  }
}
