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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let TripsService = class TripsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapTrip(trip) {
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
    async list(q) {
        const where = {
            destinations: { is_active: true },
            status: client_1.trips_status.open,
        };
        if (q.region)
            where.destinations = { is_active: true, region: q.region };
        if (q.type)
            where.type = q.type;
        if (q.status)
            where.status = q.status;
        if (q.destinationId)
            where.destination_id = BigInt(q.destinationId);
        if (q.duration)
            where.duration_days = Number(q.duration);
        if (q.minPrice || q.maxPrice) {
            where.price_per_person = {};
            if (q.minPrice)
                where.price_per_person.gte = new client_1.Prisma.Decimal(q.minPrice);
            if (q.maxPrice)
                where.price_per_person.lte = new client_1.Prisma.Decimal(q.maxPrice);
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
    async getById(id) {
        const trip = await this.prisma.trips.findFirst({
            where: { id: BigInt(id) },
            include: { destinations: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        return this.mapTrip(trip);
    }
    async create(dto) {
        const destination = await this.prisma.destinations.findFirst({
            where: {
                id: BigInt(dto.destination_id),
                is_active: true,
            },
            select: { id: true },
        });
        if (!destination) {
            throw new common_1.BadRequestException('destination_id does not exist or destination is not active');
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
                price_per_person: dto.price_per_person !== undefined
                    ? new client_1.Prisma.Decimal(dto.price_per_person)
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
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map