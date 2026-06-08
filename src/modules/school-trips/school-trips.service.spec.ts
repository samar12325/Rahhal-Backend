import { ConflictException } from '@nestjs/common';
import { trips_status, trips_type } from '@prisma/client';
import { SchoolTripsService } from './school-trips.service';

describe('SchoolTripsService', () => {
  const prisma = {
    destinations: {
      findFirst: jest.fn(),
    },
    destination_places: {
      findFirst: jest.fn(),
    },
    trips: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const emailService = {
    send: jest.fn(),
  };

  let service: SchoolTripsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SchoolTripsService(prisma as any, emailService as any);
  });

  it('returns a success message with the created trip', async () => {
    prisma.destinations.findFirst.mockResolvedValue({ id: 1n });
    prisma.destination_places.findFirst.mockResolvedValue({ id: 2n });
    prisma.trips.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        trips: {
          create: jest.fn().mockResolvedValue({ id: 55n }),
          findFirst: jest.fn().mockResolvedValue(buildTrip()),
        },
        school_trip_details: {
          create: jest.fn().mockResolvedValue({}),
        },
      }),
    );

    const result = await service.create(buildDto(), 9);

    expect(result).toMatchObject({
      id: '55',
      message: 'تم إضافة الرحلة بنجاح. انتظر الموافقة على الرحلة.',
      status: trips_status.draft,
      type: trips_type.school,
    });
  });

  it('rejects rapid duplicate submissions for the same trip payload', async () => {
    prisma.destinations.findFirst.mockResolvedValue({ id: 1n });
    prisma.destination_places.findFirst.mockResolvedValue({ id: 2n });
    prisma.trips.findFirst.mockResolvedValue({ id: 55n });

    await expect(service.create(buildDto(), 9)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

function buildDto() {
  return {
    title: 'رحلة مدرسية',
    destination_id: 1,
    place_id: 2,
    description: 'وصف الرحلة',
    start_date: '2026-06-15',
    end_date: '2026-06-16',
    duration_days: 2,
    max_participants: 30,
    school_name: 'مدرسة الرحال',
    education_level: 'ثانوي',
    students_count: 25,
    supervisors_count: 3,
    transport_type: 'حافلة',
    meeting_point: 'بوابة المدرسة',
    notes: 'ملاحظات',
  };
}

function buildTrip() {
  const createdAt = new Date('2026-06-08T10:00:00.000Z');

  return {
    id: 55n,
    title: 'رحلة مدرسية',
    destination_id: 1n,
    type: trips_type.school,
    description: 'وصف الرحلة',
    start_date: new Date('2026-06-15T00:00:00.000Z'),
    end_date: new Date('2026-06-16T00:00:00.000Z'),
    duration_days: 2,
    price_per_person: null,
    max_participants: 30,
    status: trips_status.draft,
    created_by: 9n,
    created_at: createdAt,
    updated_at: createdAt,
    destinations: {
      id: 1n,
      name: 'الرياض',
      region: 'central',
      description: 'وجهة',
      image_url: null,
      is_active: true,
      created_at: createdAt,
      updated_at: createdAt,
    },
    school_trip_details: {
      trip_id: 55n,
      place_id: 2n,
      school_name: 'مدرسة الرحال',
      education_level: 'ثانوي',
      students_count: 25,
      supervisors_count: 3,
      transport_type: 'حافلة',
      meeting_point: 'بوابة المدرسة',
      permit_file_url: null,
      notes: 'ملاحظات',
      prep_progress: 12,
      is_ready: false,
      trip_live_status: 'created',
      departure_time: null,
      return_time: null,
      supervisor_notes: null,
      tracking_last_updated_at: null,
      created_at: createdAt,
      updated_at: createdAt,
      destination_places: {
        id: 2n,
        destination_id: 1n,
        name: 'المتحف',
        type: 'historical',
        description: 'مكان',
        image_url: null,
        is_active: true,
        created_at: createdAt,
        updated_at: createdAt,
      },
    },
  };
}
