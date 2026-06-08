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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const booking_completion_1 = require("../../common/utils/booking-completion");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEFAULT_TRIP_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Trip';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
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
        if (!user)
            return null;
        return {
            ...user,
            id: user.id.toString(),
        };
    }
    async updateMe(userId, dto) {
        const id = BigInt(userId);
        const email = dto.email?.trim().toLowerCase();
        if (email) {
            const exists = await this.prisma.user.findUnique({ where: { email } });
            if (exists && exists.id !== id) {
                throw new common_1.BadRequestException('Email already in use');
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
    async getMyBookings(userId) {
        const id = BigInt(userId);
        const bookings = await this.prisma.bookings.findMany({
            where: {
                user_id: id,
                status: {
                    in: [
                        client_1.bookings_status.pending,
                        client_1.bookings_status.confirmed,
                        client_1.bookings_status.completed,
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
    mapBooking(booking) {
        const trip = booking.trips;
        const destination = trip?.destinations;
        const date = booking.scheduled_date ?? trip?.start_date ?? null;
        const image = trip?.image_url ?? destination?.image_url ?? DEFAULT_TRIP_IMAGE;
        const hasEnded = (0, booking_completion_1.isBookingCompletedByDate)({
            scheduledDate: booking.scheduled_date,
            scheduledTime: booking.scheduled_time,
            tripStartDate: trip?.start_date,
            tripEndDate: trip?.end_date,
        }) || booking.status === client_1.bookings_status.completed;
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map