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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const checkout_booking_dto_1 = require("./dto/checkout-booking.dto");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkout(userId, dto) {
        const uid = BigInt(userId);
        const tripId = BigInt(Number(dto.tripId));
        const destinationId = BigInt(Number(dto.destinationId));
        const people = Number(dto.people);
        const trip = await this.prisma.trips.findFirst({
            where: {
                id: tripId,
                destination_id: destinationId,
                status: client_1.trips_status.open,
            },
            include: {
                destinations: true,
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        const unitPrice = trip.price_per_person ? Number(trip.price_per_person) : 0;
        const requestedAmount = dto.amount !== undefined ? Number(dto.amount) : undefined;
        const computedAmount = requestedAmount ?? unitPrice * people;
        if (!Number.isFinite(computedAmount) || computedAmount <= 0) {
            throw new common_1.BadRequestException('Invalid payment amount');
        }
        const normalizedMethod = dto.paymentMethod === checkout_booking_dto_1.CheckoutPaymentMethod.applepay
            ? client_1.payments_method.applepay
            : client_1.payments_method.card;
        const scheduledDate = new Date(`${dto.date}T00:00:00.000Z`);
        if (Number.isNaN(scheduledDate.getTime())) {
            throw new common_1.BadRequestException('Invalid booking date');
        }
        const now = new Date();
        const providerTxnId = `MOCK-${Date.now()}`;
        const result = await this.prisma.$transaction(async (tx) => {
            const booking = await tx.bookings.create({
                data: {
                    trip_id: tripId,
                    user_id: uid,
                    persons_count: people,
                    total_price: new client_1.Prisma.Decimal(computedAmount),
                    scheduled_date: scheduledDate,
                    scheduled_time: dto.time,
                    status: client_1.bookings_status.confirmed,
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
                    amount: new client_1.Prisma.Decimal(computedAmount),
                    method: normalizedMethod,
                    status: client_1.payments_status.paid,
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
    mapBooking(booking) {
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
    mapPayment(payment) {
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
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map