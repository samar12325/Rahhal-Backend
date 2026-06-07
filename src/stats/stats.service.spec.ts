import {
  Prisma,
  bookings_status,
  trips_status,
  trips_type,
} from '@prisma/client';
import { StatsRange } from './dto/stats-range.dto';
import { StatsService } from './stats.service';

type FindManyDateWhere = {
  where: {
    created_at: {
      gte: Date;
      lte: Date;
    };
  };
};

type MockBooking = ReturnType<typeof createBooking>;
type MockCreatedTrip = ReturnType<typeof createCreatedTrip>;
type BookingsFindManyMock = jest.Mock<
  Promise<MockBooking[]>,
  [Prisma.bookingsFindManyArgs]
>;
type TripsFindManyMock = jest.Mock<
  Promise<MockCreatedTrip[]>,
  [Prisma.tripsFindManyArgs]
>;

describe('StatsService', () => {
  const bookingsFindMany = jest.fn() as BookingsFindManyMock;
  const tripsFindMany = jest.fn() as TripsFindManyMock;
  const prisma = {
    bookings: {
      findMany: bookingsFindMany,
    },
    trips: {
      findMany: tripsFindMany,
    },
  };

  let service: StatsService;

  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    // The service only needs the mocked Prisma methods exercised in this spec.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    service = new StatsService(prisma as any);
  });

  it('returns admin-wide trip and booking stats for the selected range', async () => {
    prisma.bookings.findMany.mockResolvedValue([
      createBooking({
        id: 1n,
        tripId: 10n,
        status: bookings_status.completed,
        totalPrice: 150,
        tripType: trips_type.school,
        destinationName: 'Riyadh',
        placeName: 'National Museum',
        createdAt: new Date('2026-04-10T10:00:00.000Z'),
      }),
      createBooking({
        id: 2n,
        tripId: 11n,
        status: bookings_status.confirmed,
        totalPrice: 200,
        tripType: trips_type.group,
        destinationName: 'Jeddah',
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      }),
    ]);
    prisma.trips.findMany.mockResolvedValue([
      createCreatedTrip({
        id: 40n,
        type: trips_type.group,
        status: trips_status.draft,
        createdAt: new Date('2026-04-09T10:00:00.000Z'),
      }),
      createCreatedTrip({
        id: 41n,
        type: trips_type.school,
        status: trips_status.open,
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      }),
      createCreatedTrip({
        id: 42n,
        type: trips_type.school,
        status: trips_status.completed,
        createdAt: new Date('2026-04-13T10:00:00.000Z'),
      }),
      createCreatedTrip({
        id: 43n,
        type: trips_type.individual,
        status: trips_status.cancelled,
        createdAt: new Date('2026-04-14T10:00:00.000Z'),
      }),
    ]);

    const result = await service.getDashboard(StatsRange.MONTH);

    const bookingsCall = prisma.bookings.findMany.mock.calls[0]?.[0] as
      | Prisma.bookingsFindManyArgs
      | undefined;
    const tripsCall = prisma.trips.findMany.mock.calls[0]?.[0] as
      | Prisma.tripsFindManyArgs
      | undefined;

    expect(bookingsCall?.where?.created_at).toBeDefined();
    expect(tripsCall?.where?.created_at).toBeDefined();
    expect(result.createdTripsStats).toEqual({
      createdTripsCount: 4,
      pendingTripsCount: 1,
      approvedTripsCount: 1,
      completedTripsCount: 1,
      rejectedTripsCount: 1,
      groupTripsCreatedCount: 1,
      schoolTripsCreatedCount: 2,
    });
    expect(result.tripStatusDistribution).toEqual([
      { status: 'pending', label: 'Pending', count: 1 },
      { status: 'approved', label: 'Approved', count: 1 },
      { status: 'completed', label: 'Completed', count: 1 },
      { status: 'rejected', label: 'Rejected', count: 1 },
    ]);
    expect(result.tripTypeDistribution).toEqual([
      { type: 'group', label: 'Group', count: 1 },
      { type: 'school', label: 'School', count: 2 },
    ]);
    expect(result.bookingStats.totalBookings).toBe(2);
    expect(result.bookingStats.totalRevenue).toBe(350);
    expect(result.bookingStats.completionRate).toBe(50);
    expect(result.bookingStats.bookingStatusDistribution).toEqual([
      { status: 'pending', label: 'Pending', count: 0 },
      { status: 'confirmed', label: 'Confirmed', count: 1 },
      { status: 'completed', label: 'Completed', count: 1 },
      { status: 'cancelled', label: 'Cancelled', count: 0 },
    ]);
    expect(Array.isArray(result.bookingStats.monthlyTrend)).toBe(true);
    expect(result.bookingStats.topDestinations).toEqual([
      { destinationName: 'Jeddah', visits: 1 },
      { destinationName: 'National Museum', visits: 1 },
    ]);
  });

  it('counts approved trips separately and excludes pending or cancelled bookings from revenue', async () => {
    prisma.bookings.findMany.mockResolvedValue([
      createBooking({
        id: 1n,
        tripId: 10n,
        status: bookings_status.pending,
        totalPrice: 120,
        tripType: trips_type.group,
        destinationName: 'Riyadh',
        createdAt: new Date('2026-04-10T10:00:00.000Z'),
      }),
      createBooking({
        id: 2n,
        tripId: 11n,
        status: bookings_status.confirmed,
        totalPrice: 200,
        tripType: trips_type.school,
        destinationName: 'Jeddah',
        createdAt: new Date('2026-04-11T10:00:00.000Z'),
      }),
      createBooking({
        id: 3n,
        tripId: 12n,
        status: bookings_status.completed,
        totalPrice: 300,
        tripType: trips_type.school,
        destinationName: 'Taif',
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      }),
      createBooking({
        id: 4n,
        tripId: 13n,
        status: bookings_status.cancelled,
        totalPrice: 999,
        tripType: trips_type.group,
        destinationName: 'Abha',
        createdAt: new Date('2026-04-13T10:00:00.000Z'),
      }),
    ]);
    prisma.trips.findMany.mockResolvedValue([
      createCreatedTrip({
        id: 40n,
        type: trips_type.group,
        status: trips_status.open,
        createdAt: new Date('2026-04-09T10:00:00.000Z'),
      }),
      createCreatedTrip({
        id: 41n,
        type: trips_type.school,
        status: trips_status.full,
        createdAt: new Date('2026-04-12T10:00:00.000Z'),
      }),
      createCreatedTrip({
        id: 42n,
        type: trips_type.school,
        status: trips_status.completed,
        createdAt: new Date('2026-04-13T10:00:00.000Z'),
      }),
    ]);

    const result = await service.getDashboard(StatsRange.MONTH);

    expect(result.createdTripsStats.approvedTripsCount).toBe(2);
    expect(result.createdTripsStats.completedTripsCount).toBe(1);
    expect(result.tripStatusDistribution).toEqual([
      { status: 'pending', label: 'Pending', count: 0 },
      { status: 'approved', label: 'Approved', count: 2 },
      { status: 'completed', label: 'Completed', count: 1 },
      { status: 'rejected', label: 'Rejected', count: 0 },
    ]);
    expect(result.bookingStats.totalRevenue).toBe(500);
    expect(result.bookingStats.bookingStatusDistribution).toEqual([
      { status: 'pending', label: 'Pending', count: 1 },
      { status: 'confirmed', label: 'Confirmed', count: 1 },
      { status: 'completed', label: 'Completed', count: 1 },
      { status: 'cancelled', label: 'Cancelled', count: 1 },
    ]);
  });

  it('uses the end of the current day as the upper range boundary', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-25T08:15:10.250Z'));

    prisma.bookings.findMany.mockResolvedValue([]);
    prisma.trips.findMany.mockResolvedValue([]);

    await service.getDashboard(StatsRange.MONTH);

    const bookingsCall = prisma.bookings.findMany.mock.calls[0]?.[0] as
      | FindManyDateWhere
      | undefined;
    const tripsCall = prisma.trips.findMany.mock.calls[0]?.[0] as
      | FindManyDateWhere
      | undefined;
    const expectedUpperBound = new Date('2026-04-25T08:15:10.250Z');
    expectedUpperBound.setHours(23, 59, 59, 999);

    expect(bookingsCall?.where.created_at.lte.toISOString()).toBe(
      expectedUpperBound.toISOString(),
    );
    expect(tripsCall?.where.created_at.lte.toISOString()).toBe(
      expectedUpperBound.toISOString(),
    );
  });

  it('returns zeroed stats when there are no trips or bookings in range', async () => {
    prisma.bookings.findMany.mockResolvedValue([]);
    prisma.trips.findMany.mockResolvedValue([]);

    const result = await service.getDashboard(StatsRange.MONTH);

    expect(result.createdTripsStats).toEqual({
      createdTripsCount: 0,
      pendingTripsCount: 0,
      approvedTripsCount: 0,
      completedTripsCount: 0,
      rejectedTripsCount: 0,
      groupTripsCreatedCount: 0,
      schoolTripsCreatedCount: 0,
    });
    expect(result.tripStatusDistribution).toEqual([
      { status: 'pending', label: 'Pending', count: 0 },
      { status: 'approved', label: 'Approved', count: 0 },
      { status: 'completed', label: 'Completed', count: 0 },
      { status: 'rejected', label: 'Rejected', count: 0 },
    ]);
    expect(result.tripTypeDistribution).toEqual([
      { type: 'group', label: 'Group', count: 0 },
      { type: 'school', label: 'School', count: 0 },
    ]);
    expect(result.bookingStats.totalBookings).toBe(0);
    expect(result.bookingStats.totalRevenue).toBe(0);
    expect(result.bookingStats.completionRate).toBe(0);
    expect(
      result.bookingStats.monthlyTrend.every(
        (item: { total: number }) => item.total === 0,
      ),
    ).toBe(true);
  });
});

function createBooking({
  id,
  tripId,
  status,
  totalPrice,
  tripType,
  destinationName,
  placeName,
  createdAt,
}: {
  id: bigint;
  tripId: bigint;
  status: bookings_status;
  totalPrice: number;
  tripType: trips_type;
  destinationName: string;
  placeName?: string;
  createdAt: Date;
}) {
  return {
    id,
    user_id: 1n,
    trip_id: tripId,
    persons_count: 1,
    total_price: totalPrice,
    status,
    created_at: createdAt,
    trips: {
      id: tripId,
      type: tripType,
      title: `Trip ${tripId.toString()}`,
      destinations: {
        id: 100n,
        name: destinationName,
      },
      school_trip_details:
        tripType === trips_type.school
          ? {
              destination_places: placeName
                ? {
                    id: 200n,
                    name: placeName,
                  }
                : null,
            }
          : null,
      group_trip_details:
        tripType === trips_type.group
          ? {
              trip_id: tripId,
            }
          : null,
    },
  };
}

function createCreatedTrip({
  id,
  type,
  status,
  createdAt,
}: {
  id: bigint;
  type: trips_type;
  status: trips_status;
  createdAt: Date;
}) {
  return {
    id,
    type,
    status,
    created_at: createdAt,
  };
}
