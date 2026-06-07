import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { event_status, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const DEFAULT_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Event';

type EventRecord = Prisma.eventsGetPayload<Record<string, never>>;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListEventsDto, adminView = false) {
    const where = this.buildWhere(query, adminView);
    const page = query.page && query.page > 0 ? query.page : 1;
    const rawLimit =
      query.limit && query.limit > 0 ? query.limit : adminView ? 12 : 100;
    const limit = Math.min(rawLimit, 100);
    const skip = (page - 1) * limit;

    const [total, activeTotal, categoryGroups, cityGroups, events] =
      await Promise.all([
        this.prisma.events.count({ where }),
        this.prisma.events.count({
          where: {
            ...where,
            status: event_status.active,
          },
        }),
        this.prisma.events.groupBy({ where, by: ['category'] }),
        this.prisma.events.groupBy({ where, by: ['city'] }),
        this.prisma.events.findMany({
          where,
          orderBy: [{ start_datetime: 'asc' }, { created_at: 'desc' }],
          skip: adminView ? skip : undefined,
          take: adminView ? limit : undefined,
        }),
      ]);

    const items = events.map((event) => this.mapEvent(event));

    if (!adminView) {
      return {
        count: items.length,
        events: items,
      };
    }

    return {
      summary: {
        totalEvents: total,
        activeEvents: activeTotal,
        categoriesCount: categoryGroups.length,
        citiesCount: cityGroups.length,
        resultsCount: total,
      },
      items,
    };
  }

  async getById(id: number, adminView = false) {
    const event = await this.prisma.events.findFirst({
      where: {
        id: BigInt(id),
        ...(adminView ? {} : { status: event_status.active }),
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapEvent(event);
  }

  async create(dto: CreateEventDto) {
    this.ensureDateRange(dto.start_datetime, dto.end_datetime);

    const created = await this.prisma.events.create({
      data: {
        title: dto.title.trim(),
        city: dto.city.trim(),
        location: dto.location.trim(),
        category: dto.category.trim(),
        description: dto.description?.trim() || null,
        image_url: dto.image_url ?? null,
        price_text: dto.price_text?.trim() || null,
        start_datetime: new Date(dto.start_datetime),
        end_datetime: dto.end_datetime ? new Date(dto.end_datetime) : null,
        official_booking_url: dto.official_booking_url ?? null,
        status: dto.status,
        created_at: new Date(),
      },
    });

    return this.mapEvent(created);
  }

  async update(id: number, dto: UpdateEventDto) {
    const existing = await this.prisma.events.findUnique({
      where: { id: BigInt(id) },
      select: {
        start_datetime: true,
        end_datetime: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const nextStart =
      dto.start_datetime ?? existing.start_datetime.toISOString();
    const nextEnd =
      dto.end_datetime !== undefined
        ? dto.end_datetime
        : existing.end_datetime?.toISOString();
    this.ensureDateRange(nextStart, nextEnd);

    const updated = await this.prisma.events.update({
      where: { id: BigInt(id) },
      data: {
        title: dto.title?.trim(),
        city: dto.city?.trim(),
        location: dto.location?.trim(),
        category: dto.category?.trim(),
        description:
          dto.description !== undefined
            ? dto.description.trim() || null
            : undefined,
        image_url:
          dto.image_url !== undefined ? dto.image_url || null : undefined,
        price_text:
          dto.price_text !== undefined
            ? dto.price_text.trim() || null
            : undefined,
        start_datetime:
          dto.start_datetime !== undefined
            ? new Date(dto.start_datetime)
            : undefined,
        end_datetime:
          dto.end_datetime !== undefined
            ? dto.end_datetime
              ? new Date(dto.end_datetime)
              : null
            : undefined,
        official_booking_url:
          dto.official_booking_url !== undefined
            ? dto.official_booking_url || null
            : undefined,
        status: dto.status,
        updated_at: new Date(),
      },
    });

    return this.mapEvent(updated);
  }

  async remove(id: number, dto: DeleteEventDto) {
    const eventId = BigInt(id);
    const existing = await this.prisma.events.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    if (dto.hardDelete) {
      await this.prisma.events.delete({ where: { id: eventId } });
      return { ok: true, deleted: true };
    }

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        status: event_status.inactive,
        updated_at: new Date(),
      },
    });

    return { ok: true, deleted: false, status: event_status.inactive };
  }

  private buildWhere(
    query: ListEventsDto,
    adminView: boolean,
  ): Prisma.eventsWhereInput {
    const where: Prisma.eventsWhereInput = {};

    if (adminView) {
      if (query.status) {
        where.status = query.status;
      } else if (!query.includeInactive) {
        where.status = event_status.active;
      }
    } else {
      where.status = event_status.active;
    }

    if (query.city?.trim()) {
      where.city = { contains: query.city.trim() };
    }

    if (query.category?.trim()) {
      where.category = { contains: query.category.trim() };
    }

    if (query.from || query.to) {
      where.start_datetime = {};
      if (query.from) where.start_datetime.gte = new Date(query.from);
      if (query.to) where.start_datetime.lte = new Date(query.to);
    }

    if (query.q?.trim()) {
      const search = query.q.trim();
      where.OR = [
        { title: { contains: search } },
        { city: { contains: search } },
        { location: { contains: search } },
        { category: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return where;
  }

  private ensureDateRange(start: string, end?: string) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('start_datetime is invalid');
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('end_datetime is invalid');
    }

    if (endDate && endDate < startDate) {
      throw new BadRequestException(
        'end_datetime must be after start_datetime',
      );
    }
  }

  private mapEvent(event: EventRecord) {
    return {
      id: event.id.toString(),
      title: event.title,
      city: event.city,
      location: event.location,
      category: event.category,
      description: event.description,
      image_url: event.image_url,
      display_image_url: event.image_url || DEFAULT_IMAGE,
      price_text: event.price_text,
      start_datetime: event.start_datetime.toISOString(),
      end_datetime: event.end_datetime?.toISOString() ?? null,
      official_booking_url: event.official_booking_url,
      status: event.status,
      created_at: event.created_at.toISOString(),
      updated_at: event.updated_at?.toISOString() ?? null,
    };
  }
}
