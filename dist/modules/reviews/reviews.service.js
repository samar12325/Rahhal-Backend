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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const booking_completion_1 = require("../../common/utils/booking-completion");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async create(userId, dto) {
        const uid = BigInt(userId);
        const bookingId = BigInt(dto.bookingId);
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                user_id: true,
                scheduled_date: true,
                scheduled_time: true,
                trips: {
                    select: {
                        start_date: true,
                        end_date: true,
                    },
                },
            },
        });
        if (!booking)
            throw new common_1.BadRequestException('Booking not found');
        if (booking.user_id !== uid)
            throw new common_1.UnauthorizedException('Not your booking');
        if (!(0, booking_completion_1.isBookingCompletedByDate)({
            scheduledDate: booking.scheduled_date,
            scheduledTime: booking.scheduled_time,
            tripStartDate: booking.trips?.start_date,
            tripEndDate: booking.trips?.end_date,
        })) {
            throw new common_1.BadRequestException('Trip has not ended yet');
        }
        const exists = await this.prisma.reviews.findFirst({
            where: { booking_id: bookingId },
            select: { id: true },
        });
        if (exists)
            throw new common_1.BadRequestException('Already reviewed');
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map