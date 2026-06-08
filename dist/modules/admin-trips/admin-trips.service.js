"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTripsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEFAULT_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Trip';
let AdminTripsService = class AdminTripsService {
    prisma;
    defaultCreatorId = BigInt(1);
    tripInclude = {
        destinations: {
            select: { id: true, name: true, region: true, image_url: true },
        },
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
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
        const items = trips.map((trip) => this.mapTrip(trip));
        const totalTrips = aggregate._count?._all ?? 0;
        const avgPrice = aggregate._avg.price_per_person !== null &&
            aggregate._avg.price_per_person !== undefined
            ? Number(aggregate._avg.price_per_person)
            : null;
        const availableSeats = Number(aggregate._sum.max_participants ?? 0);
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
    async create(dto) {
        const data = {
            title: dto.title,
            destination_id: BigInt(dto.destination_id),
            type: dto.type,
            description: dto.description ?? null,
            start_date: this.toDateOrNull(dto.start_date),
            end_date: this.toDateOrNull(dto.end_date),
            duration_days: dto.duration_days ?? null,
            price_per_person: new client_1.Prisma.Decimal(dto.price_per_person),
            old_price: dto.old_price !== undefined ? new client_1.Prisma.Decimal(dto.old_price) : null,
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
        return this.mapTrip(created);
    }
    async update(id, dto) {
        const tripId = BigInt(id);
        try {
            const updated = await this.prisma.trips.update({
                where: { id: tripId },
                data: this.buildUpdateData(dto),
                include: this.tripInclude,
            });
            return this.mapTrip(updated);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException('Trip not found');
            }
            throw error;
        }
    }
    async delete(id) {
        const tripId = BigInt(id);
        try {
            await this.prisma.trips.delete({ where: { id: tripId } });
            return { ok: true, deleted: true };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException('Trip not found');
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                await this.prisma.trips.update({
                    where: { id: tripId },
                    data: { status: 'cancelled', updated_at: new Date() },
                });
                return { ok: true, deleted: false, status: 'cancelled' };
            }
            throw error;
        }
    }
    buildWhere(query) {
        const where = {};
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
    buildUpdateData(dto) {
        const data = {
            updated_at: new Date(),
        };
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.destination_id !== undefined) {
            data.destination_id = BigInt(dto.destination_id);
        }
        if (dto.type !== undefined)
            data.type = dto.type;
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
            data.price_per_person = new client_1.Prisma.Decimal(dto.price_per_person);
        }
        if (dto.old_price !== undefined) {
            data.old_price =
                dto.old_price !== null ? new client_1.Prisma.Decimal(dto.old_price) : null;
        }
        if (dto.max_participants !== undefined) {
            data.max_participants = dto.max_participants;
        }
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.image_url !== undefined)
            data.image_url = dto.image_url ?? null;
        if (dto.includes !== undefined)
            data.includes = dto.includes;
        return data;
    }
    toDateOrNull(value) {
        if (!value)
            return null;
        return new Date(`${value}T00:00:00.000Z`);
    }
    mapTrip(trip) {
        const displayImageUrl = trip.image_url ?? trip.destinations?.image_url ?? DEFAULT_IMAGE;
        return {
            id: trip.id.toString(),
            destination_id: trip.destination_id.toString(),
            title: trip.title,
            type: trip.type,
            status: trip.status,
            price_per_person: trip.price_per_person !== null && trip.price_per_person !== undefined
                ? Number(trip.price_per_person)
                : null,
            old_price: trip.old_price !== null && trip.old_price !== undefined
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
};
exports.AdminTripsService = AdminTripsService;
exports.AdminTripsService = AdminTripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminTripsService);
//# sourceMappingURL=admin-trips.service.js.map