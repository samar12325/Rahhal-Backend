import { Injectable } from '@nestjs/common';
import {
  Prisma,
  bookings_status,
  trips_status,
  trips_type,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StatsRange } from './dto/stats-range.dto';

type RangeKey = StatsRange;
type CreatedTripStatusKey = 'pending' | 'approved' | 'completed' | 'rejected';
type CreatedTripTypeKey = 'group' | 'school';

type StatsBooking = Prisma.bookingsGetPayload<{
  include: {
    trips: {
      include: {
        destinations: true;
        school_trip_details: {
          include: {
            destination_places: true;
          };
        };
        group_trip_details: true;
      };
    };
  };
}>;

type StatsTrip = Prisma.tripsGetPayload<{
  select: {
    id: true;
    type: true;
    status: true;
    created_at: true;
  };
}>;

const RANGE_TO_MONTHS: Record<RangeKey, number> = {
  [StatsRange.MONTH]: 1,
  [StatsRange.SIX_MONTHS]: 6,
  [StatsRange.YEAR]: 12,
};

const BOOKING_STATUS_LABELS: Record<bookings_status, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const TRIP_STATUS_LABELS: Record<CreatedTripStatusKey, string> = {
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
};

const TRIP_TYPE_LABELS: Record<CreatedTripTypeKey, string> = {
  group: 'Group',
  school: 'School',
};

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(range: StatsRange) {
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
      tripStatusDistribution: this.buildTripStatusDistribution(
        createdTripsStats.statusDistribution,
      ),
      tripTypeDistribution: this.buildTripTypeDistribution(
        createdTripsStats.typeDistribution,
      ),
      bookingStats: {
        totalBookings: bookingStats.totalBookings,
        totalRevenue: bookingStats.totalRevenue,
        completionRate: bookingStats.completionRate,
        bookingStatusDistribution: this.buildBookingStatusDistribution(
          bookingStats.statusDistribution,
        ),
        monthlyTrend: bookingStats.monthlyTrend,
        topDestinations: bookingStats.topVisitedPlaces.map((place) => ({
          destinationName: place.name,
          visits: place.count,
        })),
      },
    };
  }

  private calculateCreatedTripStats(trips: StatsTrip[]) {
    const statusDistribution: Record<CreatedTripStatusKey, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
    };

    const typeDistribution: Record<CreatedTripTypeKey, number> = {
      group: 0,
      school: 0,
    };

    let approvedTripsCount = 0;

    for (const trip of trips) {
      if (trip.status === trips_status.draft) {
        statusDistribution.pending += 1;
      } else if (
        trip.status === trips_status.open ||
        trip.status === trips_status.full
      ) {
        approvedTripsCount += 1;
        statusDistribution.approved += 1;
      } else if (trip.status === trips_status.completed) {
        statusDistribution.completed += 1;
      } else if (trip.status === trips_status.cancelled) {
        statusDistribution.rejected += 1;
      }

      if (trip.type === trips_type.group) {
        typeDistribution.group += 1;
      } else if (trip.type === trips_type.school) {
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

  private calculateBookingStats(
    bookings: StatsBooking[],
    from: Date,
    to: Date,
  ) {
    const statusDistribution: Record<bookings_status, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    const topPlaces = new Map<string, number>();
    const totalRevenue = bookings.reduce((sum, booking) => {
      if (
        booking.status !== bookings_status.confirmed &&
        booking.status !== bookings_status.completed
      ) {
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
      completionRate:
        totalBookings === 0
          ? 0
          : Number(((completedBookings / totalBookings) * 100).toFixed(2)),
      statusDistribution,
      topVisitedPlaces: [...topPlaces.entries()]
        .sort(
          (left, right) =>
            right[1] - left[1] || left[0].localeCompare(right[0]),
        )
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      monthlyTrend: this.buildMonthlyTrend(bookings, from, to),
    };
  }

  private resolvePlaceName(booking: StatsBooking) {
    const trip = booking.trips;

    return (
      trip?.school_trip_details?.destination_places?.name ??
      trip?.destinations?.name ??
      trip?.title ??
      ''
    );
  }

  private buildTripStatusDistribution(
    statusDistribution: Record<CreatedTripStatusKey, number>,
  ) {
    return (Object.keys(statusDistribution) as CreatedTripStatusKey[]).map(
      (status) => ({
        status,
        label: TRIP_STATUS_LABELS[status],
        count: statusDistribution[status],
      }),
    );
  }

  private buildTripTypeDistribution(
    typeDistribution: Record<CreatedTripTypeKey, number>,
  ) {
    return (Object.keys(typeDistribution) as CreatedTripTypeKey[]).map(
      (type) => ({
        type,
        label: TRIP_TYPE_LABELS[type],
        count: typeDistribution[type],
      }),
    );
  }

  private buildBookingStatusDistribution(
    statusDistribution: Record<bookings_status, number>,
  ) {
    return (Object.keys(statusDistribution) as bookings_status[]).map(
      (status) => ({
        status,
        label: BOOKING_STATUS_LABELS[status],
        count: statusDistribution[status],
      }),
    );
  }

  private buildMonthlyTrend(bookings: StatsBooking[], from: Date, to: Date) {
    const monthlyCounts = new Map<string, number>();

    bookings.forEach((booking) => {
      const key = this.formatMonthKey(booking.created_at);
      monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1);
    });

    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const limit = new Date(to.getFullYear(), to.getMonth(), 1);
    const trend: Array<{ ym: string; total: number }> = [];

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

  private formatMonthKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private getRange(range: RangeKey) {
    const to = new Date();
    const from = new Date(to);
    const months = RANGE_TO_MONTHS[range] ?? RANGE_TO_MONTHS[StatsRange.MONTH];

    if (months === 12) {
      from.setFullYear(from.getFullYear() - 1);
    } else {
      from.setMonth(from.getMonth() - months);
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}
