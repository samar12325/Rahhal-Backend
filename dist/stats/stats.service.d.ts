import { PrismaService } from '../prisma/prisma.service';
import { StatsRange } from './dto/stats-range.dto';
type CreatedTripStatusKey = 'pending' | 'approved' | 'completed' | 'rejected';
type CreatedTripTypeKey = 'group' | 'school';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(range: StatsRange): Promise<{
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
            status: CreatedTripStatusKey;
            label: string;
            count: number;
        }[];
        tripTypeDistribution: {
            type: CreatedTripTypeKey;
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
    private calculateCreatedTripStats;
    private calculateBookingStats;
    private resolvePlaceName;
    private buildTripStatusDistribution;
    private buildTripTypeDistribution;
    private buildBookingStatusDistribution;
    private buildMonthlyTrend;
    private formatMonthKey;
    private getRange;
    private formatDate;
}
export {};
