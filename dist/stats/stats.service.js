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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const stats_range_dto_1 = require("./dto/stats-range.dto");
const RANGE_TO_MONTHS = {
    [stats_range_dto_1.StatsRange.MONTH]: 1,
    [stats_range_dto_1.StatsRange.SIX_MONTHS]: 6,
    [stats_range_dto_1.StatsRange.YEAR]: 12,
};
const BOOKING_STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
};
const TRIP_STATUS_LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
};
const TRIP_TYPE_LABELS = {
    group: 'Group',
    school: 'School',
};
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(range) {
        const { from, to } = this.getRange(range);
        const [bookings, trips] = await Promise.all([
            this.prisma.bookings.findMany({
                where: {
                    created_at: {
                        gte: from,
                        lte: to,
                    },
                },
                include: {
                    trips: {
                        include: {
                            destinations: true,
                            school_trip_details: {
                                include: {
                                    destination_places: true,
                                },
                            },
                            group_trip_details: true,
                        },
                    },
                },
            }),
            this.prisma.trips.findMany({
                where: {
                    created_at: {
                        gte: from,
                        lte: to,
                    },
                },
                select: {
                    id: true,
                    type: true,
                    status: true,
                    created_at: true,
                },
            }),
        ]);
        const bookingStats = this.calculateBookingStats(bookings, from, to);
        const createdTripsStats = this.calculateCreatedTripStats(trips);
        return {
            range,
            from: this.formatDate(from),
            to: this.formatDate(to),
            createdTripsStats: {
                createdTripsCount: createdTripsStats.createdTripsCount,
                pendingTripsCount: createdTripsStats.pendingTripsCount,
                approvedTripsCount: createdTripsStats.approvedTripsCount,
                completedTripsCount: createdTripsStats.completedTripsCount,
                rejectedTripsCount: createdTripsStats.rejectedTripsCount,
                groupTripsCreatedCount: createdTripsStats.groupTripsCreatedCount,
                schoolTripsCreatedCount: createdTripsStats.schoolTripsCreatedCount,
            },
            tripStatusDistribution: this.buildTripStatusDistribution(createdTripsStats.statusDistribution),
            tripTypeDistribution: this.buildTripTypeDistribution(createdTripsStats.typeDistribution),
            bookingStats: {
                totalBookings: bookingStats.totalBookings,
                totalRevenue: bookingStats.totalRevenue,
                completionRate: bookingStats.completionRate,
                bookingStatusDistribution: this.buildBookingStatusDistribution(bookingStats.statusDistribution),
                monthlyTrend: bookingStats.monthlyTrend,
                topDestinations: bookingStats.topVisitedPlaces.map((place) => ({
                    destinationName: place.name,
                    visits: place.count,
                })),
            },
        };
    }
    calculateCreatedTripStats(trips) {
        const statusDistribution = {
            pending: 0,
            approved: 0,
            completed: 0,
            rejected: 0,
        };
        const typeDistribution = {
            group: 0,
            school: 0,
        };
        let approvedTripsCount = 0;
        for (const trip of trips) {
            if (trip.status === client_1.trips_status.draft) {
                statusDistribution.pending += 1;
            }
            else if (trip.status === client_1.trips_status.open ||
                trip.status === client_1.trips_status.full) {
                approvedTripsCount += 1;
                statusDistribution.approved += 1;
            }
            else if (trip.status === client_1.trips_status.completed) {
                statusDistribution.completed += 1;
            }
            else if (trip.status === client_1.trips_status.cancelled) {
                statusDistribution.rejected += 1;
            }
            if (trip.type === client_1.trips_type.group) {
                typeDistribution.group += 1;
            }
            else if (trip.type === client_1.trips_type.school) {
                typeDistribution.school += 1;
            }
        }
        return {
            createdTripsCount: trips.length,
            pendingTripsCount: statusDistribution.pending,
            approvedTripsCount,
            completedTripsCount: statusDistribution.completed,
            rejectedTripsCount: statusDistribution.rejected,
            groupTripsCreatedCount: typeDistribution.group,
            schoolTripsCreatedCount: typeDistribution.school,
            statusDistribution,
            typeDistribution,
        };
    }
    calculateBookingStats(bookings, from, to) {
        const statusDistribution = {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        };
        const topPlaces = new Map();
        const totalRevenue = bookings.reduce((sum, booking) => {
            if (booking.status !== client_1.bookings_status.confirmed &&
                booking.status !== client_1.bookings_status.completed) {
                return sum;
            }
            return sum + Number(booking.total_price ?? 0);
        }, 0);
        bookings.forEach((booking) => {
            statusDistribution[booking.status] += 1;
            const placeName = this.resolvePlaceName(booking);
            if (placeName) {
                topPlaces.set(placeName, (topPlaces.get(placeName) ?? 0) + 1);
            }
        });
        const totalBookings = bookings.length;
        const completedBookings = statusDistribution.completed;
        return {
            totalBookings,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            completionRate: totalBookings === 0
                ? 0
                : Number(((completedBookings / totalBookings) * 100).toFixed(2)),
            statusDistribution,
            topVisitedPlaces: [...topPlaces.entries()]
                .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
                .slice(0, 5)
                .map(([name, count]) => ({ name, count })),
            monthlyTrend: this.buildMonthlyTrend(bookings, from, to),
        };
    }
    resolvePlaceName(booking) {
        const trip = booking.trips;
        return (trip?.school_trip_details?.destination_places?.name ??
            trip?.destinations?.name ??
            trip?.title ??
            '');
    }
    buildTripStatusDistribution(statusDistribution) {
        return Object.keys(statusDistribution).map((status) => ({
            status,
            label: TRIP_STATUS_LABELS[status],
            count: statusDistribution[status],
        }));
    }
    buildTripTypeDistribution(typeDistribution) {
        return Object.keys(typeDistribution).map((type) => ({
            type,
            label: TRIP_TYPE_LABELS[type],
            count: typeDistribution[type],
        }));
    }
    buildBookingStatusDistribution(statusDistribution) {
        return Object.keys(statusDistribution).map((status) => ({
            status,
            label: BOOKING_STATUS_LABELS[status],
            count: statusDistribution[status],
        }));
    }
    buildMonthlyTrend(bookings, from, to) {
        const monthlyCounts = new Map();
        bookings.forEach((booking) => {
            const key = this.formatMonthKey(booking.created_at);
            monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1);
        });
        const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
        const limit = new Date(to.getFullYear(), to.getMonth(), 1);
        const trend = [];
        while (cursor <= limit) {
            const key = this.formatMonthKey(cursor);
            trend.push({
                ym: key,
                total: monthlyCounts.get(key) ?? 0,
            });
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return trend;
    }
    formatMonthKey(date) {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        return `${year}-${month}`;
    }
    getRange(range) {
        const to = new Date();
        const from = new Date(to);
        const months = RANGE_TO_MONTHS[range] ?? RANGE_TO_MONTHS[stats_range_dto_1.StatsRange.MONTH];
        if (months === 12) {
            from.setFullYear(from.getFullYear() - 1);
        }
        else {
            from.setMonth(from.getMonth() - months);
        }
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return { from, to };
    }
    formatDate(date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map