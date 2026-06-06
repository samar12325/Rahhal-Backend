import { StatsRange, StatsRangeDto } from './dto/stats-range.dto';
import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getTripStats(query: StatsRangeDto): Promise<{
        range: StatsRange;
        from: string;
        to: string;
        createdTripsStats: {
            createdTripsCount: number;
            pendingTripsCount: number;
            approvedTripsCount: number;
            completedTripsCount: number;
            rejectedTripsCount: number;
            groupTripsCreatedCount: number;
            schoolTripsCreatedCount: number;
        };
        tripStatusDistribution: {
            status: "pending" | "approved" | "rejected" | "completed";
            label: string;
            count: number;
        }[];
        tripTypeDistribution: {
            type: "group" | "school";
            label: string;
            count: number;
        }[];
        bookingStats: {
            totalBookings: number;
            totalRevenue: number;
            completionRate: number;
            bookingStatusDistribution: {
                status: import(".prisma/client").$Enums.bookings_status;
                label: string;
                count: number;
            }[];
            monthlyTrend: {
                ym: string;
                total: number;
            }[];
            topDestinations: {
                destinationName: string;
                visits: number;
            }[];
        };
    }>;
    getLegacyDashboard(query: StatsRangeDto): Promise<{
        range: StatsRange;
        from: string;
        to: string;
        createdTripsStats: {
            createdTripsCount: number;
            pendingTripsCount: number;
            approvedTripsCount: number;
            completedTripsCount: number;
            rejectedTripsCount: number;
            groupTripsCreatedCount: number;
            schoolTripsCreatedCount: number;
        };
        tripStatusDistribution: {
            status: "pending" | "approved" | "rejected" | "completed";
            label: string;
            count: number;
        }[];
        tripTypeDistribution: {
            type: "group" | "school";
            label: string;
            count: number;
        }[];
        bookingStats: {
            totalBookings: number;
            totalRevenue: number;
            completionRate: number;
            bookingStatusDistribution: {
                status: import(".prisma/client").$Enums.bookings_status;
                label: string;
                count: number;
            }[];
            monthlyTrend: {
                ym: string;
                total: number;
            }[];
            topDestinations: {
                destinationName: string;
                visits: number;
            }[];
        };
    }>;
}
