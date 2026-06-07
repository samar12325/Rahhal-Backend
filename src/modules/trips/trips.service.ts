import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, trips_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ListTripsDto } from './dto/list-trips.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  private mapTrip(trip: {
    id: bigint;
    title: string;
    destination_id: bigint;
    type: string;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    duration_days: number | null;
    price_per_person: Prisma.Decimal | null;
    max_participants: number | null;
    status: string;
    created_by: bigint;
    created_at: Date;
    updated_at: Date | null;
    destinations?: {
      id: bigint;
      name: string;
      region: string;
      description: string | null;
      image_url: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date | null;
    };
  }) {
    return {
      id: trip.id.toString(),
      title: trip.title,
      destination_id: trip.destination_id.toString(),
      type: trip.type,
      description: trip.description,
      start_date: trip.start_date
        ? trip.start_date.toISOString().slice(0, 10)
        : null,
      end_date: trip.end_date ? trip.end_date.toISOString().slice(0, 10) : null,
      duration_days: trip.duration_days,
      price_per_person: trip.price_per_person
        ? trip.price_per_person.toString()
        : null,
      max_participants: trip.max_participants,
      status: trip.status,
      created_by: trip.created_by.toString(),
      created_at: trip.created_at,
      updated_at: trip.updated_at,
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
    };
  }

  async list(q: ListTripsDto) {
    const where: Prisma.tripsWhereInput = {
      destinations: { is_active: true },
      status: trips_status.open,
    };

    if (q.region) where.destinations = { is_active: true, region: q.region };
    if (q.type) where.type = q.type;
    if (q.status) where.status = q.status;
    if (q.destinationId) where.destination_id = BigInt(q.destinationId);
    if (q.duration) where.duration_days = Number(q.duration);
    if (q.minPrice || q.maxPrice) {
      where.price_per_person = {};
      if (q.minPrice)
        where.price_per_person.gte = new Prisma.Decimal(q.minPrice);
      if (q.maxPrice)
        where.price_per_person.lte = new Prisma.Decimal(q.maxPrice);
    }
    if (q.q) {
      where.OR = [
        { title: { contains: q.q } },
        { description: { contains: q.q } },
        { destinations: { name: { contains: q.q } } },
      ];
    }

    const trips = await this.prisma.trips.findMany({
      where,
      include: { destinations: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      count: trips.length,
      trips: trips.map((trip) => this.mapTrip(trip)),
    };
  }

  async getById(id: number) {
    const trip = await this.prisma.trips.findFirst({
      where: { id: BigInt(id) },
      include: { destinations: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.mapTrip(trip);
  }

  async create(dto: CreateTripDto) {
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

    const trip = await this.prisma.trips.create({
      data: {
        title: dto.title,
        destination_id: BigInt(dto.destination_id),
        type: dto.type,
        description: dto.description ?? null,
        start_date: dto.start_date
          ? new Date(`${dto.start_date}T00:00:00.000Z`)
          : null,
        end_date: dto.end_date
          ? new Date(`${dto.end_date}T00:00:00.000Z`)
          : null,
        duration_days: dto.duration_days ?? null,
        price_per_person:
          dto.price_per_person !== undefined
            ? new Prisma.Decimal(dto.price_per_person)
            : null,
        max_participants: dto.max_participants ?? null,
        status: dto.status,
        created_by: BigInt(dto.created_by),
        created_at: new Date(),
      },
      include: { destinations: true },
    });

    return this.mapTrip(trip);
  }
}
