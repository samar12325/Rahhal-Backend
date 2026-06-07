import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  bookings_status,
  trips_status,
  trips_type,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupTripDto } from './dto/create-group-trip.dto';
import { ListGroupTripsDto } from './dto/list-group-trips.dto';

type GroupTripPayload = Prisma.tripsGetPayload<{
  include: {
    destinations: true;
    group_trip_details: true;
    bookings: { select: { persons_count: true; status: true } };
  };
}>;

@Injectable()
export class GroupTripsService {
  constructor(private prisma: PrismaService) {}

  private shortenParticipantName(name?: string | null) {
    const normalized = String(name ?? '').trim();
    if (!normalized) return 'مشارك';

    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];

    const firstName = parts[0];
    const secondName = parts[1];
    const secondInitial = secondName.charAt(0);

    return secondInitial ? `${firstName} ${secondInitial}.` : firstName;
  }

  private getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private formatDate(value?: Date | null) {
    return value ? value.toISOString().slice(0, 10) : null;
  }

  private getTripStartDate(trip: GroupTripPayload) {
    const source = trip.start_date ?? trip.end_date ?? null;
    if (!source) return null;

    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getCurrentParticipants(trip: GroupTripPayload) {
    return (trip.bookings ?? [])
      .filter(
        (booking) =>
          booking.status === bookings_status.confirmed ||
          booking.status === bookings_status.completed,
      )
      .reduce((sum, booking) => sum + Number(booking.persons_count || 0), 0);
  }

  private isPastTrip(trip: GroupTripPayload) {
    const tripStartDate = this.getTripStartDate(trip);
    if (!tripStartDate) return false;
    return tripStartDate < this.getTodayStart();
  }

  private canJoinTrip(trip: GroupTripPayload) {
    const capacity =
      trip.max_participants ??
      trip.group_trip_details?.required_participants ??
      0;
    const currentParticipants = this.getCurrentParticipants(trip);

    return (
      !this.isPastTrip(trip) &&
      trip.status === trips_status.open &&
      (!capacity || currentParticipants < capacity)
    );
  }

  private mapTrip(trip: GroupTripPayload) {
    const currentParticipants = this.getCurrentParticipants(trip);
    const capacity =
      trip.max_participants ??
      trip.group_trip_details?.required_participants ??
      0;

    return {
      id: trip.id.toString(),
      title: trip.title,
      destination_id: trip.destination_id.toString(),
      type: trip.type,
      description: trip.description,
      image_url: trip.image_url,
      start_date: this.formatDate(trip.start_date),
      end_date: this.formatDate(trip.end_date),
      duration_days: trip.duration_days,
      price_per_person: trip.price_per_person
        ? trip.price_per_person.toString()
        : null,
      max_participants: trip.max_participants,
      status: trip.status,
      created_by: trip.created_by.toString(),
      created_at: trip.created_at,
      updated_at: trip.updated_at,
      current_participants: currentParticipants,
      capacity,
      is_past: this.isPastTrip(trip),
      can_join: this.canJoinTrip(trip),
      destination: trip.destinations
        ? {
            id: trip.destinations.id.toString(),
            name: trip.destinations.name,
            region: trip.destinations.region,
            description: trip.destinations.description,
            image_url: trip.destinations.image_url,
            is_active: trip.destinations.is_active,
            created_at: trip.destinations.created_at,
            updated_at: trip.destinations.updated_at,
          }
        : undefined,
      group_details: trip.group_trip_details
        ? {
            trip_id: trip.group_trip_details.trip_id.toString(),
            required_participants:
              trip.group_trip_details.required_participants,
            organizer_id: trip.group_trip_details.organizer_id.toString(),
            join_deadline: this.formatDate(
              trip.group_trip_details.join_deadline,
            ),
            notes: trip.group_trip_details.notes,
            created_at: trip.group_trip_details.created_at,
            updated_at: trip.group_trip_details.updated_at,
          }
        : null,
    };
  }

  async list(q: ListGroupTripsDto) {
    const where: Prisma.tripsWhereInput = {
      type: trips_type.group,
      destinations: { is_active: true },
    };

    if (q.status) {
      where.status = q.status;
    } else if (!q.createdBy) {
      where.status = { in: [trips_status.open, trips_status.full] };
    }

    if (q.createdBy) where.created_by = BigInt(q.createdBy);
    if (q.destinationId) where.destination_id = BigInt(q.destinationId);
    if (q.q) {
      where.OR = [
        { title: { contains: q.q } },
        { description: { contains: q.q } },
        { destinations: { name: { contains: q.q } } },
      ];
    }

    const trips = await this.prisma.trips.findMany({
      where,
      include: {
        destinations: true,
        group_trip_details: true,
        bookings: { select: { persons_count: true, status: true } },
      },
      orderBy: { start_date: 'asc' },
    });

    return {
      count: trips.length,
      trips: trips.map((trip) => this.mapTrip(trip)),
    };
  }

  async listAvailable(q: ListGroupTripsDto) {
    const result = await this.list({ ...q, status: trips_status.open });
    const trips = result.trips.filter((trip) => !trip.is_past && trip.can_join);

    return {
      count: trips.length,
      trips,
    };
  }

  async listPast(q: ListGroupTripsDto) {
    const result = await this.list(q);
    const trips = result.trips.filter((trip) => trip.is_past);

    return {
      count: trips.length,
      trips,
    };
  }

  async getById(id: number) {
    const trip = await this.prisma.trips.findFirst({
      where: { id: BigInt(id), type: trips_type.group },
      include: {
        destinations: true,
        group_trip_details: true,
        bookings: { select: { persons_count: true, status: true } },
      },
    });

    if (!trip) {
      throw new NotFoundException('Group trip not found');
    }

    return this.mapTrip(trip);
  }

  async getParticipants(
    tripId: number,
    currentUser: { userId?: string | number; role?: string },
  ) {
    const normalizedRole = String(currentUser?.role ?? '')
      .trim()
      .toLowerCase();
    const requesterId = currentUser?.userId ? BigInt(currentUser.userId) : null;

    const trip = await this.prisma.trips.findFirst({
      where: { id: BigInt(tripId), type: trips_type.group },
      select: { id: true, title: true, type: true },
    });

    if (!trip) {
      throw new NotFoundException('Group trip not found');
    }

    const isAdmin = normalizedRole === 'admin';

    if (!isAdmin) {
      if (!requesterId) {
        throw new ForbiddenException(
          'You are not allowed to view participants',
        );
      }

      const hasBooking = await this.prisma.bookings.findFirst({
        where: {
          trip_id: trip.id,
          user_id: requesterId,
        },
        select: { id: true },
      });

      if (!hasBooking) {
        throw new ForbiddenException(
          'You are not allowed to view participants',
        );
      }
    }

    const bookings = await this.prisma.bookings.findMany({
      where: {
        trip_id: trip.id,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return {
      tripId: trip.id.toString(),
      tripTitle: trip.title,
      viewer_role: isAdmin ? 'admin' : 'user',
      participants: bookings.map((booking) => {
        const bookingStatus =
          booking.status === bookings_status.cancelled
            ? 'cancelled'
            : booking.status === bookings_status.pending
              ? 'pending'
              : 'paid';

        if (isAdmin) {
          return {
            booking_id: booking.id.toString(),
            user_id: booking.user_id.toString(),
            name: booking.users?.name?.trim() || 'مشارك',
            email: booking.users?.email ?? null,
            persons_count: booking.persons_count ?? null,
            status: bookingStatus,
            raw_status: booking.status,
          };
        }

        return {
          booking_id: booking.id.toString(),
          name: this.shortenParticipantName(booking.users?.name),
          persons_count: booking.persons_count ?? null,
        };
      }),
    };
  }

  async create(
    dto: CreateGroupTripDto,
    createdBy: number,
    uploadedImageUrl?: string | null,
    fallbackImageUrl?: string | null,
  ) {
    if (!Number.isFinite(createdBy) || createdBy <= 0) {
      throw new BadRequestException('created_by is required');
    }

    if (!dto.destination_id) {
      throw new BadRequestException('destination_id is required');
    }
    if (!dto.required_participants) {
      throw new BadRequestException('required_participants is required');
    }

    const destination = await this.prisma.destinations.findFirst({
      where: {
        id: BigInt(dto.destination_id),
        is_active: true,
      },
      select: { id: true },
    });

    if (!destination) {
      throw new BadRequestException(
        'destination_id does not exist or destination is not active',
      );
    }

    const startDate = dto.start_date
      ? new Date(`${dto.start_date}T00:00:00.000Z`)
      : null;
    const endDate = dto.end_date
      ? new Date(`${dto.end_date}T00:00:00.000Z`)
      : startDate;
    const durationDays =
      dto.duration_days ??
      (startDate && endDate
        ? Math.max(
            1,
            Math.round((endDate.getTime() - startDate.getTime()) / 86400000) +
              1,
          )
        : null);

    const maxParticipants = dto.max_participants ?? dto.required_participants;
    const manualImageUrl = dto.image_url?.trim() ? dto.image_url.trim() : null;
    const imageUrl =
      uploadedImageUrl ?? manualImageUrl ?? fallbackImageUrl ?? null;

    if (maxParticipants && maxParticipants < dto.required_participants) {
      throw new BadRequestException(
        'max_participants must be greater than or equal to required_participants',
      );
    }

    const trip = await this.prisma.$transaction(async (tx) => {
      const createdTrip = await tx.trips.create({
        data: {
          title: dto.title,
          destination_id: BigInt(dto.destination_id),
          type: trips_type.group,
          description: dto.description ?? null,
          start_date: startDate,
          end_date: endDate,
          duration_days: durationDays,
          price_per_person:
            dto.price_per_person !== undefined
              ? new Prisma.Decimal(dto.price_per_person)
              : null,
          image_url: imageUrl,
          max_participants: maxParticipants ?? null,
          status: trips_status.draft,
          created_by: BigInt(createdBy),
          created_at: new Date(),
        },
      });

      await tx.group_trip_details.create({
        data: {
          trip_id: createdTrip.id,
          required_participants: dto.required_participants,
          organizer_id: BigInt(createdBy),
          join_deadline: dto.join_deadline
            ? new Date(`${dto.join_deadline}T00:00:00.000Z`)
            : null,
          notes: dto.notes ?? null,
        },
      });

      return tx.trips.findFirst({
        where: { id: createdTrip.id },
        include: {
          destinations: true,
          group_trip_details: true,
          bookings: { select: { persons_count: true, status: true } },
        },
      });
    });

    if (!trip) {
      throw new BadRequestException('Unable to create group trip');
    }

    return this.mapTrip(trip);
  }
}
