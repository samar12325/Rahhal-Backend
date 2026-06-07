import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, trips_status, trips_type } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminApprovalsQueryDto,
  ApprovalStatus,
} from './dto/admin-approvals-query.dto';

type ApprovalTripPayload = Prisma.tripsGetPayload<{
  include: {
    destinations: true;
    users: { select: { id: true; name: true } };
    group_trip_details: {
      include: { users: { select: { id: true; name: true } } };
    };
    school_trip_details: true;
  };
}>;

type CurrentUser = {
  userId: string;
  role: string;
};

@Injectable()
export class AdminApprovalsService {
  private readonly tripInclude = {
    destinations: true,
    users: { select: { id: true, name: true } },
    group_trip_details: {
      include: { users: { select: { id: true, name: true } } },
    },
    school_trip_details: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminApprovalsQueryDto, currentUser: CurrentUser) {
    const where = this.buildWhere(query, currentUser);

    const trips = await this.prisma.trips.findMany({
      where,
      include: this.tripInclude,
      orderBy: { created_at: 'desc' },
    });

    const items = trips.map((trip) =>
      this.mapTrip(trip as ApprovalTripPayload),
    );

    const summary = items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === ApprovalStatus.approved) acc.approved += 1;
        if (item.status === ApprovalStatus.pending) acc.pending += 1;
        if (item.status === ApprovalStatus.rejected) acc.rejected += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 },
    );

    return { count: items.length, summary, items };
  }

  async approve(id: number, reviewerId: number) {
    const reviewer = this.ensureReviewer(reviewerId);
    await this.ensureTripExists(id);

    const updated = await this.prisma.trips.update({
      where: { id: BigInt(id) },
      data: {
        status: trips_status.open,
        reviewed_by: reviewer,
        reviewed_at: new Date(),
        rejection_reason: null,
        updated_at: new Date(),
      },
      include: this.tripInclude,
    });

    return this.mapTrip(updated as ApprovalTripPayload);
  }

  async reject(id: number, reviewerId: number, reason: string) {
    const reviewer = this.ensureReviewer(reviewerId);
    if (!reason || reason.trim().length < 2) {
      throw new BadRequestException('Rejection reason is required');
    }

    await this.ensureTripExists(id);

    const updated = await this.prisma.trips.update({
      where: { id: BigInt(id) },
      data: {
        status: trips_status.cancelled,
        reviewed_by: reviewer,
        reviewed_at: new Date(),
        rejection_reason: reason.trim(),
        updated_at: new Date(),
      },
      include: this.tripInclude,
    });

    return this.mapTrip(updated as ApprovalTripPayload);
  }

  private buildWhere(
    query: AdminApprovalsQueryDto,
    currentUser: CurrentUser,
  ): Prisma.tripsWhereInput {
    const where: Prisma.tripsWhereInput = {
      type: { in: [trips_type.group, trips_type.school] },
    };

    if (!this.isAdmin(currentUser.role)) {
      where.created_by = BigInt(currentUser.userId);
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status === ApprovalStatus.pending) {
      where.status = trips_status.draft;
    } else if (query.status === ApprovalStatus.rejected) {
      where.status = trips_status.cancelled;
    } else if (query.status === ApprovalStatus.approved) {
      where.status = {
        in: [trips_status.open, trips_status.full, trips_status.completed],
      };
    } else {
      where.status = {
        in: [
          trips_status.draft,
          trips_status.open,
          trips_status.full,
          trips_status.completed,
          trips_status.cancelled,
        ],
      };
    }

    if (query.q?.trim()) {
      const search = query.q.trim();
      where.OR = [
        { title: { contains: search } },
        { destinations: { name: { contains: search } } },
        { school_trip_details: { school_name: { contains: search } } },
        { group_trip_details: { notes: { contains: search } } },
      ];
    }

    return where;
  }

  private isAdmin(role: string) {
    return role?.trim().toLowerCase() === 'admin';
  }

  private mapTrip(trip: ApprovalTripPayload) {
    const isSchoolTrip = trip.type === trips_type.school;
    const isGroupTrip = trip.type === trips_type.group;

    const organizerName = isSchoolTrip
      ? (trip.school_trip_details?.school_name ?? trip.users?.name ?? '')
      : (trip.group_trip_details?.users?.name ?? trip.users?.name ?? '');

    const people = isSchoolTrip
      ? (trip.school_trip_details?.students_count ?? trip.max_participants ?? 0)
      : (trip.max_participants ??
        trip.group_trip_details?.required_participants ??
        0);

    const price =
      trip.price_per_person !== null && trip.price_per_person !== undefined
        ? Number(trip.price_per_person)
        : null;

    const note = isSchoolTrip
      ? trip.school_trip_details?.notes
      : trip.group_trip_details?.notes;

    return {
      id: trip.id.toString(),
      tripTitle: trip.title,
      city: trip.destinations?.name ?? '',
      organizer: organizerName,
      date: trip.start_date ? trip.start_date.toISOString().slice(0, 10) : null,
      people: Number(people ?? 0),
      price,
      submittedAt: trip.created_at.toISOString(),
      status: this.mapApprovalStatus(trip.status),
      note: note ?? '',
      isSchoolTrip,
      isGroupTrip,
      hasDocuments: Boolean(trip.school_trip_details?.permit_file_url),
      permitFileUrl: trip.school_trip_details?.permit_file_url ?? null,
      rejectedReason: trip.rejection_reason ?? '',
      dbStatus: trip.status,
      type: trip.type,
      destinationId: trip.destination_id.toString(),
      createdBy: trip.created_by.toString(),
      reviewedBy: trip.reviewed_by ? trip.reviewed_by.toString() : null,
      reviewedAt: trip.reviewed_at ? trip.reviewed_at.toISOString() : null,
    };
  }

  private mapApprovalStatus(status: trips_status): ApprovalStatus {
    if (status === trips_status.cancelled) return ApprovalStatus.rejected;
    if (
      status === trips_status.open ||
      status === trips_status.full ||
      status === trips_status.completed
    ) {
      return ApprovalStatus.approved;
    }
    return ApprovalStatus.pending;
  }

  private ensureReviewer(reviewerId: number) {
    if (!Number.isFinite(reviewerId) || reviewerId <= 0) {
      throw new BadRequestException('Invalid reviewer');
    }
    return BigInt(reviewerId);
  }

  private async ensureTripExists(id: number) {
    const trip = await this.prisma.trips.findFirst({
      where: {
        id: BigInt(id),
        type: { in: [trips_type.group, trips_type.school] },
      },
      select: { id: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip request not found');
    }
  }
}
