import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminTripsQueryDto } from './dto/admin-trips-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminTripDto } from './dto/create-admin-trip.dto';
import { UpdateAdminTripDto } from './dto/update-admin-trip.dto';

const DEFAULT_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Trip';

type TripWithDestination = Prisma.tripsGetPayload<{
  include: {
    destinations: {
      select: {
        id: true;
        name: true;
        region: true;
        image_url: true;
      };
    };
  };
}>;

type TripWithOptionalImage = TripWithDestination & {
  image_url?: string | null;
};

@Injectable()
export class AdminTripsService {
  private readonly defaultCreatorId = BigInt(1);

  private readonly tripInclude = {
    destinations: {
      select: { id: true, name: true, region: true, image_url: true },
    },
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminTripsQueryDto) {
    const where = this.buildWhere(query);
    const page = query.page && query.page > 0 ? query.page : 1;
    const rawLimit = query.limit && query.limit > 0 ? query.limit : 12;
    const limit = Math.min(rawLimit, 100);
    const skip = (page - 1) * limit;

    const [aggregate, destinationGroups, trips] = await Promise.all([
      this.prisma.trips.aggregate({
        where,
        _count: { _all: true },
        _avg: { price_per_person: true },
        _sum: { max_participants: true },
      }),
      this.prisma.trips.groupBy({
        where,
        by: ['destination_id'],
      }),
      this.prisma.trips.findMany({
        where,
        include: this.tripInclude,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items = trips.map((trip) =>
      this.mapTrip(trip as TripWithOptionalImage),
    );

    const totalTrips = aggregate._count?._all ?? 0;
    const avgPrice =
      aggregate._avg.price_per_person !== null &&
      aggregate._avg.price_per_person !== undefined
        ? Number(aggregate._avg.price_per_person)
        : null;
    const availableSeats = Number(aggregate._sum.max_participants ?? 0);
    // Reviews table is only linked to bookings in the current schema.
    // Without a direct trip_id or destination_id we cannot build an accurate
    // aggregation scoped to the filtered trips, so we return null per spec.
    const avgRating = null;

    return {
      summary: {
        totalTrips,
        avgPrice,
        citiesCount: destinationGroups.length,
        availableSeats,
        avgRating,
        resultsCount: totalTrips,
      },
      items,
    };
  }

  async create(dto: CreateAdminTripDto) {
    const data: Prisma.tripsUncheckedCreateInput = {
      title: dto.title,
      destination_id: BigInt(dto.destination_id),
      type: dto.type,
      description: dto.description ?? null,
      start_date: this.toDateOrNull(dto.start_date),
      end_date: this.toDateOrNull(dto.end_date),
      duration_days: dto.duration_days ?? null,
      price_per_person: new Prisma.Decimal(dto.price_per_person),
      old_price:
        dto.old_price !== undefined ? new Prisma.Decimal(dto.old_price) : null,
      max_participants: dto.max_participants,
      status: dto.status,
      image_url: dto.image_url ?? null,
      includes: dto.includes ?? undefined,
      created_by: this.defaultCreatorId,
      created_at: new Date(),
    };

    const created = await this.prisma.trips.create({
      data,
      include: this.tripInclude,
    });

    return this.mapTrip(created as TripWithOptionalImage);
  }

  async update(id: number, dto: UpdateAdminTripDto) {
    const tripId = BigInt(id);

    try {
      const updated = await this.prisma.trips.update({
        where: { id: tripId },
        data: this.buildUpdateData(dto),
        include: this.tripInclude,
      });
      return this.mapTrip(updated as TripWithOptionalImage);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Trip not found');
      }
      throw error;
    }
  }

  async delete(id: number) {
    const tripId = BigInt(id);
    try {
      await this.prisma.trips.delete({ where: { id: tripId } });
      return { ok: true, deleted: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Trip not found');
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        await this.prisma.trips.update({
          where: { id: tripId },
          data: { status: 'cancelled', updated_at: new Date() },
        });
        return { ok: true, deleted: false, status: 'cancelled' };
      }

      throw error;
    }
  }

  private buildWhere(query: AdminTripsQueryDto): Prisma.tripsWhereInput {
    const where: Prisma.tripsWhereInput = {};

    if (query.destinationId) {
      where.destination_id = BigInt(query.destinationId);
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q?.trim()) {
      const search = query.q.trim();
      where.OR = [
        { title: { contains: search } },
        { destinations: { name: { contains: search } } },
      ];
    }

    return where;
  }

  private buildUpdateData(
    dto: UpdateAdminTripDto,
  ): Prisma.tripsUncheckedUpdateInput {
    const data: Prisma.tripsUncheckedUpdateInput = {
      updated_at: new Date(),
    };

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.destination_id !== undefined) {
      data.destination_id = BigInt(dto.destination_id);
    }
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.description !== undefined)
      data.description = dto.description ?? null;
    if (dto.start_date !== undefined) {
      data.start_date = this.toDateOrNull(dto.start_date);
    }
    if (dto.end_date !== undefined) {
      data.end_date = this.toDateOrNull(dto.end_date);
    }
    if (dto.duration_days !== undefined) {
      data.duration_days = dto.duration_days ?? null;
    }
    if (dto.price_per_person !== undefined) {
      data.price_per_person = new Prisma.Decimal(dto.price_per_person);
    }
    if (dto.old_price !== undefined) {
      data.old_price =
        dto.old_price !== null ? new Prisma.Decimal(dto.old_price) : null;
    }
    if (dto.max_participants !== undefined) {
      data.max_participants = dto.max_participants;
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.image_url !== undefined) data.image_url = dto.image_url ?? null;
    if (dto.includes !== undefined) data.includes = dto.includes;
    return data;
  }

  private toDateOrNull(value?: string | null) {
    if (!value) return null;
    return new Date(`${value}T00:00:00.000Z`);
  }

  private mapTrip(trip: TripWithOptionalImage) {
    const displayImageUrl =
      trip.image_url ?? trip.destinations?.image_url ?? DEFAULT_IMAGE;

    return {
      id: trip.id.toString(),
      destination_id: trip.destination_id.toString(),
      title: trip.title,
      type: trip.type,
      status: trip.status,
      price_per_person:
        trip.price_per_person !== null && trip.price_per_person !== undefined
          ? Number(trip.price_per_person)
          : null,
      old_price:
        trip.old_price !== null && trip.old_price !== undefined
          ? Number(trip.old_price)
          : null,
      description: trip.description,
      start_date: trip.start_date
        ? trip.start_date.toISOString().slice(0, 10)
        : null,
      end_date: trip.end_date ? trip.end_date.toISOString().slice(0, 10) : null,
      duration_days: trip.duration_days,
      max_participants: trip.max_participants,
      image_url: trip.image_url,
      display_image_url: displayImageUrl,
      includes: Array.isArray(trip.includes) ? trip.includes : null,
      destination: trip.destinations
        ? {
            id: trip.destinations.id.toString(),
            name: trip.destinations.name,
            region: trip.destinations.region,
            image_url: trip.destinations.image_url,
          }
        : null,
      created_at: trip.created_at.toISOString(),
    };
  }
}
