import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  bookings_status,
  payments_method,
  payments_status,
  Prisma,
  trips_status,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CheckoutBookingDto,
  CheckoutPaymentMethod,
} from './dto/checkout-booking.dto';

type CheckoutBookingRecord = Prisma.bookingsGetPayload<{
  include: {
    trips: {
      include: {
        destinations: true;
      };
    };
  };
}>;

type CheckoutPaymentRecord = Prisma.paymentsGetPayload<{
  include: {
    bookings: true;
  };
}>;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string, dto: CheckoutBookingDto) {
    const uid = BigInt(userId);
    const tripId = BigInt(Number(dto.tripId));
    const destinationId = BigInt(Number(dto.destinationId));
    const people = Number(dto.people);

    const trip = await this.prisma.trips.findFirst({
      where: {
        id: tripId,
        destination_id: destinationId,
        status: trips_status.open,
      },
      include: {
        destinations: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const unitPrice = trip.price_per_person ? Number(trip.price_per_person) : 0;
    const requestedAmount =
      dto.amount !== undefined ? Number(dto.amount) : undefined;
    const computedAmount = requestedAmount ?? unitPrice * people;

    if (!Number.isFinite(computedAmount) || computedAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const normalizedMethod =
      dto.paymentMethod === CheckoutPaymentMethod.applepay
        ? payments_method.applepay
        : payments_method.card;

    const scheduledDate = new Date(`${dto.date}T00:00:00.000Z`);
    if (Number.isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid booking date');
    }

    const now = new Date();
    const providerTxnId = `MOCK-${Date.now()}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.create({
        data: {
          trip_id: tripId,
          user_id: uid,
          persons_count: people,
          total_price: new Prisma.Decimal(computedAmount),
          scheduled_date: scheduledDate,
          scheduled_time: dto.time,
          status: bookings_status.confirmed,
          created_at: now,
        },
        include: {
          trips: {
            include: {
              destinations: true,
            },
          },
        },
      });

      const payment = await tx.payments.create({
        data: {
          booking_id: booking.id,
          amount: new Prisma.Decimal(computedAmount),
          method: normalizedMethod,
          status: payments_status.paid,
          provider_txn_id: providerTxnId,
          paid_at: now,
          created_at: now,
        },
        include: {
          bookings: true,
        },
      });

      return { booking, payment };
    });

    return {
      success: true,
      booking: this.mapBooking(result.booking),
      payment: this.mapPayment(result.payment),
    };
  }

  private mapBooking(booking: CheckoutBookingRecord) {
    return {
      id: booking.id.toString(),
      tripId: booking.trip_id.toString(),
      userId: booking.user_id.toString(),
      people: booking.persons_count,
      totalPrice: Number(booking.total_price),
      date: booking.scheduled_date
        ? booking.scheduled_date.toISOString().slice(0, 10)
        : null,
      time: booking.scheduled_time ?? null,
      status: booking.status,
      createdAt: booking.created_at,
      trip: booking.trips
        ? {
            id: booking.trips.id.toString(),
            title: booking.trips.title,
            destinationId: booking.trips.destination_id.toString(),
            destinationName: booking.trips.destinations?.name ?? '',
          }
        : null,
    };
  }

  private mapPayment(payment: CheckoutPaymentRecord) {
    return {
      id: payment.id.toString(),
      bookingId: payment.booking_id.toString(),
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      providerTxnId: payment.provider_txn_id,
      paidAt: payment.paid_at,
      createdAt: payment.created_at,
    };
  }
}
