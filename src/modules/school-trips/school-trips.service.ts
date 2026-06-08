import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  destinations_region,
  parent_approval_status,
  school_trip_live_status,
  student_attendance_status,
  trip_parent_approvals,
  trips_status,
  trips_type,
} from '@prisma/client';
import { isEmail } from 'class-validator';
import { randomBytes } from 'crypto';
import type { Express } from 'express';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { CreateParentApprovalDto } from './dto/create-parent-approval.dto';
import { CreateSchoolTripDto } from './dto/create-school-trip.dto';
import {
  SendAllParentApprovalsDto,
  SendAllParentApprovalStudentDto,
} from './dto/upload-parent-approvals.dto';
import {
  UpdateSchoolTripLiveStatusDto,
  UpdateStudentAttendanceDto,
} from './dto/update-school-trip-preparation.dto';

const REQUIRED_UPLOAD_COLUMNS = [
  'studentName',
  'fatherName',
  'parentPhone',
  'email',
] as const;

const SAUDI_PHONE_PATTERN = /^05\d{8}$/;

type RequiredUploadColumn = (typeof REQUIRED_UPLOAD_COLUMNS)[number];

type SchoolTripPayload = Prisma.tripsGetPayload<{
  include: {
    destinations: true;
    school_trip_details: { include: { destination_places: true } };
  };
}>;

type SchoolTripReportPayload = Prisma.tripsGetPayload<{
  include: {
    destinations: true;
    school_trip_details: { include: { destination_places: true } };
    trip_parent_approvals: {
      orderBy: { created_at: 'asc' };
    };
  };
}>;

type ParentApprovalPayload = trip_parent_approvals & {
  trips?: {
    title: string;
  } | null;
};

type TrackingApprovalPayload = trip_parent_approvals & {
  trips?: {
    title: string;
    school_trip_details: {
      trip_live_status: school_trip_live_status;
      departure_time: Date | null;
      return_time: Date | null;
      supervisor_notes: string | null;
      tracking_last_updated_at: Date | null;
      education_level: string | null;
    } | null;
  } | null;
};

type SchoolTripsCurrentUser = {
  userId?: string | number;
  role?: string;
};

type ParentApprovalInputRow = {
  rowNumber?: number;
  studentName: string;
  fatherName: string;
  parentPhone: string;
  email: string;
};

type NormalizedParentApprovalRow = {
  rowNumber: number;
  studentName: string;
  fatherName: string;
  parentPhone: string;
  email: string;
  normalizedPhone: string;
  normalizedEmail: string;
  validationStatus: 'valid' | 'invalid';
  reasons: string[];
};

@Injectable()
export class SchoolTripsService {
  private readonly pendingCreateRequests = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private readonly regionLabels: Record<destinations_region, string> = {
    west: 'ط§ظ„ط؛ط±ط¨ظٹط©',
    east: 'ط§ظ„ط´ط±ظ‚ظٹط©',
    north: 'ط§ظ„ط´ظ…ط§ظ„ظٹط©',
    south: 'ط§ظ„ط¬ظ†ظˆط¨ظٹط©',
    central: 'ط§ظ„ظˆط³ط·ظ‰',
  };

  private isAdmin(role?: string) {
    return typeof role === 'string' && role.trim().toLowerCase() === 'admin';
  }

  private getTodayDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private ensureTripDatesAreValid(dto: CreateSchoolTripDto) {
    if (!dto.start_date || !dto.end_date) {
      throw new BadRequestException('start_date and end_date are required');
    }

    if (dto.start_date > dto.end_date) {
      throw new BadRequestException(
        'start_date must be before or equal to end_date',
      );
    }

    const today = this.getTodayDateKey();
    if (dto.start_date < today || dto.end_date < today) {
      throw new BadRequestException('Past trip dates are not allowed');
    }
  }

  private normalizeCreateValue(value?: string | null) {
    return value?.trim().toLowerCase() ?? '';
  }

  private buildCreateRequestKey(dto: CreateSchoolTripDto, createdBy: number) {
    return [
      createdBy,
      this.normalizeCreateValue(dto.title),
      dto.destination_id,
      dto.place_id,
      this.normalizeCreateValue(dto.school_name),
      this.normalizeCreateValue(dto.education_level),
      dto.start_date,
      dto.end_date,
      dto.duration_days,
      dto.max_participants ?? '',
      dto.students_count,
      dto.supervisors_count,
      this.normalizeCreateValue(dto.transport_type),
      this.normalizeCreateValue(dto.meeting_point),
      this.normalizeCreateValue(dto.description),
      this.normalizeCreateValue(dto.notes),
    ].join('|');
  }

  private async ensureNoRecentDuplicateTrip(
    dto: CreateSchoolTripDto,
    createdBy: number,
  ) {
    const recentWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const duplicateTrip = await this.prisma.trips.findFirst({
      where: {
        title: dto.title.trim(),
        destination_id: BigInt(dto.destination_id),
        type: trips_type.school,
        created_by: BigInt(createdBy),
        start_date: new Date(`${dto.start_date}T00:00:00.000Z`),
        end_date: new Date(`${dto.end_date}T00:00:00.000Z`),
        created_at: { gte: recentWindowStart },
        school_trip_details: {
          is: {
            place_id: BigInt(dto.place_id),
            school_name: dto.school_name.trim(),
            education_level: dto.education_level.trim(),
            students_count: dto.students_count,
            supervisors_count: dto.supervisors_count,
            transport_type: dto.transport_type.trim(),
            meeting_point: dto.meeting_point.trim(),
            notes: dto.notes?.trim() ?? null,
          },
        },
      },
      select: { id: true },
    });

    if (duplicateTrip) {
      throw new ConflictException(
        'يتم الآن إضافة الرحلة أو تمت إضافتها بالفعل. فضلاً انتظر ولا تكرر الضغط.',
      );
    }
  }

  private getRequesterId(currentUser?: SchoolTripsCurrentUser) {
    if (
      currentUser?.userId === undefined ||
      currentUser?.userId === null ||
      currentUser?.userId === ''
    ) {
      return null;
    }

    try {
      return BigInt(currentUser.userId);
    } catch {
      return null;
    }
  }

  private buildScopedTripsWhere(currentUser?: SchoolTripsCurrentUser) {
    const where: Prisma.tripsWhereInput = {
      type: trips_type.school,
    };

    if (this.isAdmin(currentUser?.role)) {
      return where;
    }

    const requesterId = this.getRequesterId(currentUser);
    if (!requesterId) {
      throw new ForbiddenException(
        'You are not allowed to access school trips',
      );
    }

    where.created_by = requesterId;
    return where;
  }

  private async getScopedTripOrThrow(
    tripId: number,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    const where = this.buildScopedTripsWhere(currentUser);

    const trip = await this.prisma.trips.findFirst({
      where: {
        ...where,
        id: BigInt(tripId),
      },
      include: {
        destinations: true,
        school_trip_details: { include: { destination_places: true } },
      },
    });

    if (!trip) {
      throw new NotFoundException('School trip not found');
    }

    return trip;
  }

  private mapTrip(trip: SchoolTripPayload) {
    return {
      id: trip.id.toString(),
      title: trip.title,
      destination_id: trip.destination_id.toString(),
      type: trip.type,
      description: trip.description,
      start_date: trip.start_date
        ? trip.start_date.toISOString().slice(0, 10)
        : null,
      end_date: trip.end_date ? trip.end_date.toISOString().slice(0, 10) : null,
      duration_days: trip.duration_days,
      price_per_person: trip.price_per_person
        ? trip.price_per_person.toString()
        : null,
      max_participants: trip.max_participants,
      status: trip.status,
      created_by: trip.created_by.toString(),
      created_at: trip.created_at,
      updated_at: trip.updated_at,
      destination: trip.destinations
        ? {
            id: trip.destinations.id.toString(),
            name: trip.destinations.name,
            region: trip.destinations.region,
            description: trip.destinations.description,
            image_url: trip.destinations.image_url,
            is_active: trip.destinations.is_active,
            created_at: trip.destinations.created_at,
            updated_at: trip.destinations.updated_at,
          }
        : undefined,
      school_details: trip.school_trip_details
        ? {
            trip_id: trip.school_trip_details.trip_id.toString(),
            place_id: trip.school_trip_details.place_id?.toString() ?? null,
            school_name: trip.school_trip_details.school_name,
            education_level: trip.school_trip_details.education_level,
            students_count: trip.school_trip_details.students_count,
            supervisors_count: trip.school_trip_details.supervisors_count,
            transport_type: trip.school_trip_details.transport_type,
            meeting_point: trip.school_trip_details.meeting_point,
            permit_file_url: trip.school_trip_details.permit_file_url,
            notes: trip.school_trip_details.notes,
            prep_progress: trip.school_trip_details.prep_progress ?? 12,
            is_ready: trip.school_trip_details.is_ready ?? false,
            trip_live_status: trip.school_trip_details.trip_live_status,
            departure_time: trip.school_trip_details.departure_time,
            return_time: trip.school_trip_details.return_time,
            supervisor_notes: trip.school_trip_details.supervisor_notes,
            tracking_last_updated_at:
              trip.school_trip_details.tracking_last_updated_at,
            created_at: trip.school_trip_details.created_at,
            updated_at: trip.school_trip_details.updated_at,
            place: trip.school_trip_details.destination_places
              ? {
                  id: trip.school_trip_details.destination_places.id.toString(),
                  destination_id:
                    trip.school_trip_details.destination_places.destination_id.toString(),
                  name: trip.school_trip_details.destination_places.name,
                  type: trip.school_trip_details.destination_places.type,
                  description:
                    trip.school_trip_details.destination_places.description,
                  image_url:
                    trip.school_trip_details.destination_places.image_url,
                  is_active:
                    trip.school_trip_details.destination_places.is_active,
                  created_at:
                    trip.school_trip_details.destination_places.created_at,
                  updated_at:
                    trip.school_trip_details.destination_places.updated_at,
                }
              : null,
          }
        : null,
    };
  }

  async listRegions() {
    const regions = await this.prisma.destinations.findMany({
      where: { is_active: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
      select: { region: true },
    });

    return regions.map((item) => ({
      value: item.region,
      label: this.regionLabels[item.region],
    }));
  }

  async listCities(region: string) {
    if (!region) {
      throw new BadRequestException('region is required');
    }

    const cities = await this.prisma.destinations.findMany({
      where: {
        region: region as destinations_region,
        is_active: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        region: true,
      },
    });

    return cities.map((city) => ({
      id: city.id.toString(),
      name: city.name,
      region: city.region,
    }));
  }

  async listPlaces(destinationId: string) {
    if (!destinationId || !/^\d+$/.test(destinationId)) {
      throw new BadRequestException('destinationId is required');
    }

    const places = await this.prisma.destination_places.findMany({
      where: {
        destination_id: BigInt(destinationId),
        is_active: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        image_url: true,
      },
    });

    return places.map((place) => ({
      id: place.id.toString(),
      name: place.name,
      type: place.type,
      description: place.description,
      image_url: place.image_url,
    }));
  }

  async listParentApprovals(tripId?: string) {
    try {
      const approvals = await this.prisma.trip_parent_approvals.findMany({
        where:
          tripId && /^\d+$/.test(tripId)
            ? { trip_id: BigInt(tripId) }
            : undefined,
        orderBy: { created_at: 'desc' },
      });

      return approvals.map((approval) => this.mapParentApproval(approval));
    } catch (error) {
      console.error('Failed to list parent approvals:', error);
      console.error(error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async uploadParentApprovalsFile(
    file: Express.Multer.File | undefined,
    tripId: number,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    await this.getScopedTripOrThrow(tripId, currentUser);

    const rows = this.parseParentApprovalFile(file);
    const previouslySentEmails = await this.getPreviouslySentEmails(
      tripId,
      rows.map((row) => row.email),
    );
    const validation = this.validateParentApprovalRows(
      rows,
      previouslySentEmails,
    );

    return {
      valid: validation.valid,
      rows: validation.rows.map((row) => ({
        rowNumber: row.rowNumber,
        studentName: row.studentName,
        fatherName: row.fatherName,
        parentPhone: row.normalizedPhone,
        email: row.normalizedEmail,
        validationStatus: row.validationStatus,
        reasons: row.reasons,
      })),
      errors: validation.errors,
      summary: validation.summary,
    };
  }

  async sendAllParentApprovals(
    dto: SendAllParentApprovalsDto,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    await this.getScopedTripOrThrow(dto.tripId, currentUser);

    const previouslySentEmails = await this.getPreviouslySentEmails(
      dto.tripId,
      dto.students.map((student) => student.email),
    );
    const validation = this.validateParentApprovalRows(
      dto.students,
      previouslySentEmails,
    );

    if (!validation.valid) {
      throw new BadRequestException(
        'Cannot send approvals while the uploaded rows contain validation errors.',
      );
    }

    const results: Array<{
      rowNumber: number;
      email: string;
      status: 'sent' | 'failed';
      error: string | null;
    }> = [];

    for (const row of validation.rows) {
      results.push(await this.dispatchParentApproval(dto.tripId, row));
    }

    return {
      results,
      summary: {
        total: results.length,
        sent: results.filter((result) => result.status === 'sent').length,
        failed: results.filter((result) => result.status === 'failed').length,
      },
    };
  }

  async createParentApproval(dto: CreateParentApprovalDto) {
    try {
      const parentEmail = dto.parentEmail.trim().toLowerCase();
      const tripId = dto.trip_id ?? null;

      if (tripId) {
        await this.ensureApprovalEmailWasNotSent(tripId, parentEmail);
      }

      const approval = await this.createParentApprovalRecord({
        tripId,
        studentName: dto.studentName.trim(),
        parentName: dto.parentName.trim(),
        parentPhone: dto.parentPhone.trim(),
        parentEmail,
      });

      const mailResult = await this.sendApprovalEmailAndPersistStatus(approval);

      return {
        ...this.mapParentApproval(mailResult.approval),
        emailSent: mailResult.sent,
        emailError: mailResult.sent ? null : mailResult.error,
        message: mailResult.sent
          ? 'Approval created and email sent'
          : 'Approval created but email sending failed',
      };
    } catch (error) {
      console.error('Failed to create parent approval:', error);
      console.error(error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async deleteParentApproval(id: number) {
    await this.prisma.trip_parent_approvals.delete({
      where: { id: BigInt(id) },
    });

    return { ok: true };
  }

  async getParentApprovalByToken(token: string) {
    const approval = await this.prisma.trip_parent_approvals.findUnique({
      where: { approval_token: token },
      include: {
        trips: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException('Parent approval not found');
    }

    return this.mapParentApproval(approval);
  }

  async updateParentApprovalStatus(token: string, approvalStatus: string) {
    const approval = await this.prisma.trip_parent_approvals.update({
      where: { approval_token: token },
      data: {
        approval_status: approvalStatus as parent_approval_status,
        approved_at: approvalStatus === 'approved' ? new Date() : null,
        updated_at: new Date(),
      },
    });

    return this.mapParentApproval(approval);
  }

  async getPreparation(tripId: number, currentUser?: SchoolTripsCurrentUser) {
    const where = this.buildScopedTripsWhere(currentUser);
    const trip = await this.prisma.trips.findFirst({
      where: {
        ...where,
        id: BigInt(tripId),
      },
      include: {
        destinations: true,
        school_trip_details: { include: { destination_places: true } },
        trip_parent_approvals: {
          where: {
            trip_id: BigInt(tripId),
            approval_status: parent_approval_status.approved,
          },
          orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('School trip not found');
    }

    return this.mapPreparationPayload(trip);
  }

  async updateStudentAttendance(
    tripId: number,
    approvalId: number,
    dto: UpdateStudentAttendanceDto,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    await this.getScopedTripOrThrow(tripId, currentUser);

    const approval = await this.prisma.trip_parent_approvals.findFirst({
      where: {
        id: BigInt(approvalId),
        trip_id: BigInt(tripId),
        approval_status: parent_approval_status.approved,
      },
      include: {
        trips: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(
        'Approved student record was not found for this trip',
      );
    }

    const supervisorName = await this.getSupervisorName(currentUser);
    const markedAt = new Date();
    const trackingToken =
      dto.attendanceStatus === 'present'
        ? (approval.tracking_token ?? (await this.createUniqueTrackingToken()))
        : approval.tracking_token;

    const updatedApproval = await this.prisma.trip_parent_approvals.update({
      where: { id: approval.id },
      data: {
        attendance_status:
          dto.attendanceStatus === 'present'
            ? student_attendance_status.present
            : student_attendance_status.absent,
        attendance_marked_at: markedAt,
        attendance_marked_by_name: supervisorName,
        tracking_token: trackingToken ?? undefined,
        updated_at: markedAt,
      },
      include: {
        trips: {
          select: {
            title: true,
          },
        },
      },
    });

    await this.prisma.school_trip_details.update({
      where: { trip_id: BigInt(tripId) },
      data: {
        tracking_last_updated_at: markedAt,
      },
    });

    if (dto.attendanceStatus === 'present' && trackingToken) {
      const trackingLink = this.buildAbsoluteTrackingLink(trackingToken);
      const mailResult = await this.sendTrackingLinkEmail({
        parentEmail: updatedApproval.parent_email,
        parentName: updatedApproval.parent_name,
        studentName: updatedApproval.student_name,
        tripName: updatedApproval.trips?.title || 'رحلة مدرسية',
        trackingLink,
      });

      await this.prisma.trip_parent_approvals.update({
        where: { id: updatedApproval.id },
        data: {
          tracking_link_sent_at: mailResult.sent ? markedAt : null,
          last_email_error: mailResult.sent ? null : mailResult.error,
          updated_at: new Date(),
        },
      });
    }

    if (dto.attendanceStatus === 'absent') {
      const mailResult = await this.sendAbsenceNotificationEmail({
        parentEmail: updatedApproval.parent_email,
        parentName: updatedApproval.parent_name,
        studentName: updatedApproval.student_name,
        tripName: updatedApproval.trips?.title || 'رحلة مدرسية',
      });

      await this.prisma.trip_parent_approvals.update({
        where: { id: updatedApproval.id },
        data: {
          last_email_error: mailResult.sent ? null : mailResult.error,
          updated_at: new Date(),
        },
      });
    }

    return this.getPreparation(tripId, currentUser);
  }

  async sendTrackingLinks(
    tripId: number,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    await this.getScopedTripOrThrow(tripId, currentUser);

    const approvals = await this.prisma.trip_parent_approvals.findMany({
      where: {
        trip_id: BigInt(tripId),
        approval_status: parent_approval_status.approved,
        attendance_status: student_attendance_status.present,
      },
      include: {
        trips: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
    });

    let sent = 0;
    let failed = 0;

    for (const approval of approvals) {
      const trackingToken =
        approval.tracking_token ?? (await this.createUniqueTrackingToken());
      if (!approval.tracking_token) {
        await this.prisma.trip_parent_approvals.update({
          where: { id: approval.id },
          data: { tracking_token: trackingToken, updated_at: new Date() },
        });
      }

      const mailResult = await this.sendTrackingLinkEmail({
        parentEmail: approval.parent_email,
        parentName: approval.parent_name,
        studentName: approval.student_name,
        tripName: approval.trips?.title || 'رحلة مدرسية',
        trackingLink: this.buildAbsoluteTrackingLink(trackingToken),
      });

      await this.prisma.trip_parent_approvals.update({
        where: { id: approval.id },
        data: {
          tracking_link_sent_at: mailResult.sent ? new Date() : null,
          last_email_error: mailResult.sent ? null : mailResult.error,
          updated_at: new Date(),
        },
      });

      if (mailResult.sent) {
        sent += 1;
      } else {
        failed += 1;
      }
    }

    await this.prisma.school_trip_details.update({
      where: { trip_id: BigInt(tripId) },
      data: {
        tracking_last_updated_at: new Date(),
      },
    });

    return {
      sent,
      failed,
      skipped:
        (await this.prisma.trip_parent_approvals.count({
          where: {
            trip_id: BigInt(tripId),
            approval_status: parent_approval_status.approved,
            attendance_status: {
              not: student_attendance_status.present,
            },
          },
        })) ?? 0,
    };
  }

  async updateTripLiveStatus(
    tripId: number,
    dto: UpdateSchoolTripLiveStatusDto,
    currentUser?: SchoolTripsCurrentUser,
  ) {
    await this.getScopedTripOrThrow(tripId, currentUser);

    const existing = await this.prisma.school_trip_details.findUnique({
      where: { trip_id: BigInt(tripId) },
      select: {
        trip_id: true,
        trip_live_status: true,
        departure_time: true,
        return_time: true,
        supervisor_notes: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('School trip details not found');
    }

    const now = new Date();
    const nextStatus = dto.tripStatus ?? existing.trip_live_status;

    await this.prisma.school_trip_details.update({
      where: { trip_id: BigInt(tripId) },
      data: {
        trip_live_status: nextStatus,
        supervisor_notes:
          dto.supervisorNotes !== undefined
            ? dto.supervisorNotes.trim() || null
            : existing.supervisor_notes,
        departure_time:
          nextStatus === school_trip_live_status.in_progress
            ? (existing.departure_time ?? now)
            : existing.departure_time,
        return_time:
          nextStatus === school_trip_live_status.completed
            ? (existing.return_time ?? now)
            : nextStatus === school_trip_live_status.created
              ? null
              : existing.return_time,
        tracking_last_updated_at: now,
      },
    });

    return this.getPreparation(tripId, currentUser);
  }

  async getTrackingByToken(token: string) {
    const approval = await this.prisma.trip_parent_approvals.findUnique({
      where: { tracking_token: token },
      include: {
        trips: {
          select: {
            title: true,
            school_trip_details: {
              select: {
                trip_live_status: true,
                departure_time: true,
                return_time: true,
                supervisor_notes: true,
                tracking_last_updated_at: true,
                education_level: true,
              },
            },
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException('Tracking link not found');
    }

    if (approval.attendance_status !== student_attendance_status.present) {
      throw new ForbiddenException(
        'Tracking is only available for حاضر students',
      );
    }

    return this.mapTrackingPayload(approval);
  }

  private mapParentApproval(approval: ParentApprovalPayload) {
    const approvalLink = `/parent-approval/${approval.approval_token}`;
    const trackingLink = approval.tracking_token
      ? this.buildTrackingLink(approval.tracking_token)
      : null;

    return {
      id: approval.id.toString(),
      tripId: approval.trip_id?.toString() ?? null,
      tripName:
        approval.trips?.title ||
        '\u0631\u062d\u0644\u0629 \u0645\u062f\u0631\u0633\u064a\u0629',
      studentName: approval.student_name,
      parentName: approval.parent_name,
      parentPhone: approval.parent_phone,
      parentEmail: approval.parent_email,
      approvalStatus: approval.approval_status || 'pending',
      attendanceStatus: approval.attendance_status || 'unprepared',
      attendanceMarkedAt: approval.attendance_marked_at,
      attendanceMarkedByName: approval.attendance_marked_by_name,
      approvalToken: approval.approval_token,
      approvalLink,
      trackingToken: approval.tracking_token,
      trackingLink,
      trackingLinkSentAt: approval.tracking_link_sent_at,
      approvedAt: approval.approved_at,
      emailSentAt: approval.email_sent_at,
      lastEmailError: approval.last_email_error,
      createdAt: approval.created_at,
      updatedAt: approval.updated_at,
    };
  }

  private mapPreparationPayload(
    trip: Prisma.tripsGetPayload<{
      include: {
        destinations: true;
        school_trip_details: { include: { destination_places: true } };
        trip_parent_approvals: true;
      };
    }>,
  ) {
    const details = trip.school_trip_details;
    if (!details) {
      throw new NotFoundException('School trip details not found');
    }

    const students = trip.trip_parent_approvals.map((approval) => ({
      id: approval.id.toString(),
      studentName: approval.student_name,
      grade: details.education_level ?? null,
      approvalStatus: approval.approval_status ?? 'pending',
      attendanceStatus: approval.attendance_status ?? 'unprepared',
      attendanceTime: this.toIsoOrNull(approval.attendance_marked_at),
      supervisorName: approval.attendance_marked_by_name ?? null,
      trackingLinkSentAt: this.toIsoOrNull(approval.tracking_link_sent_at),
    }));

    const counters = students.reduce(
      (acc, student) => {
        acc.totalApproved += 1;
        if (student.attendanceStatus === 'present') {
          acc.present += 1;
        } else if (student.attendanceStatus === 'absent') {
          acc.absent += 1;
        } else {
          acc.unprepared += 1;
        }
        return acc;
      },
      {
        totalApproved: 0,
        present: 0,
        absent: 0,
        unprepared: 0,
      },
    );

    return {
      trip: {
        id: trip.id.toString(),
        title: trip.title,
        destinationName: trip.destinations?.name ?? null,
        placeName: details.destination_places?.name ?? null,
        educationLevel: details.education_level ?? null,
        liveStatus: details.trip_live_status,
        departureTime: this.toIsoOrNull(details.departure_time),
        returnTime: this.toIsoOrNull(details.return_time),
        supervisorNotes: details.supervisor_notes ?? '',
        lastUpdated: this.toIsoOrNull(details.tracking_last_updated_at),
      },
      counters,
      students,
    };
  }

  private mapTrackingPayload(approval: TrackingApprovalPayload) {
    const trip = approval.trips;
    const details = trip?.school_trip_details;

    return {
      tripName: trip?.title ?? 'رحلة مدرسية',
      studentName: approval.student_name,
      grade: details?.education_level ?? null,
      studentStatus: approval.attendance_status ?? 'unprepared',
      tripStatus: details?.trip_live_status ?? school_trip_live_status.created,
      departureTime: this.toIsoOrNull(details?.departure_time),
      returnTime: this.toIsoOrNull(details?.return_time),
      lastUpdated:
        this.toIsoOrNull(details?.tracking_last_updated_at) ??
        this.toIsoOrNull(approval.attendance_marked_at),
      supervisorNotes: details?.supervisor_notes ?? '',
      attendanceTime: this.toIsoOrNull(approval.attendance_marked_at),
    };
  }

  private async createUniqueApprovalToken() {
    let token = randomBytes(18).toString('hex');

    while (
      await this.prisma.trip_parent_approvals.findUnique({
        where: { approval_token: token },
        select: { id: true },
      })
    ) {
      token = randomBytes(18).toString('hex');
    }

    return token;
  }

  private async createUniqueTrackingToken() {
    let token = randomBytes(24).toString('hex');

    while (
      await this.prisma.trip_parent_approvals.findUnique({
        where: { tracking_token: token },
        select: { id: true },
      })
    ) {
      token = randomBytes(24).toString('hex');
    }

    return token;
  }

  private getFrontendUrl() {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(
      /\/$/,
      '',
    );
  }

  private buildApprovalLink(token: string) {
    return `/parent-approval/${token}`;
  }

  private buildAbsoluteApprovalLink(token: string) {
    return `${this.getFrontendUrl()}${this.buildApprovalLink(token)}`;
  }

  private buildTrackingLink(token: string) {
    return `/trip-tracking/${token}`;
  }

  private buildAbsoluteTrackingLink(token: string) {
    return `${this.getFrontendUrl()}${this.buildTrackingLink(token)}`;
  }

  private toIsoOrNull(value?: Date | null) {
    return value ? value.toISOString() : null;
  }

  private async getSupervisorName(currentUser?: SchoolTripsCurrentUser) {
    const requesterId = this.getRequesterId(currentUser);
    if (!requesterId) {
      return 'Supervisor';
    }

    const user = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { name: true },
    });

    return user?.name?.trim() || 'Supervisor';
  }

  private normalizeCellValue(value: unknown) {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value).trim() : '';
    }

    if (typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value).trim();
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? '' : value.toISOString().trim();
    }

    return '';
  }

  private normalizePhoneValue(value: unknown) {
    const digits = this.normalizeCellValue(value).replace(/\D/g, '');
    if (digits.length === 9 && digits.startsWith('5')) {
      return `0${digits}`;
    }

    return digits;
  }

  private normalizeEmailValue(value: unknown) {
    return this.normalizeCellValue(value).toLowerCase();
  }

  private buildUploadColumnLookup(headerRow: unknown[]) {
    const headerMap = new Map<string, string>();

    for (const headerCell of headerRow) {
      const normalizedHeader = this.normalizeCellValue(headerCell);
      if (!normalizedHeader) {
        continue;
      }

      headerMap.set(normalizedHeader.toLowerCase(), normalizedHeader);
    }

    return REQUIRED_UPLOAD_COLUMNS.reduce<Record<RequiredUploadColumn, string>>(
      (lookup, column) => {
        lookup[column] = headerMap.get(column.toLowerCase()) || '';
        return lookup;
      },
      {
        studentName: '',
        fatherName: '',
        parentPhone: '',
        email: '',
      },
    );
  }

  private parseParentApprovalFile(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Upload a .xlsx or .csv file first.');
    }

    const extension = file.originalname
      ? file.originalname
          .slice(file.originalname.lastIndexOf('.'))
          .toLowerCase()
      : '';

    if (!['.xlsx', '.csv'].includes(extension)) {
      throw new BadRequestException('Only .xlsx and .csv files are supported.');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      raw: false,
    });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('The uploaded file is empty.');
    }

    const sheet = workbook.Sheets[sheetName];
    const headerRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
    });
    const headerRow = Array.isArray(headerRows[0]) ? headerRows[0] : [];
    const columnLookup = this.buildUploadColumnLookup(headerRow);
    const missingColumns = REQUIRED_UPLOAD_COLUMNS.filter(
      (column) => !columnLookup[column],
    );

    if (missingColumns.length) {
      throw new BadRequestException(
        `Missing required columns: ${missingColumns.join(', ')}`,
      );
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });

    if (!rawRows.length) {
      throw new BadRequestException(
        'The uploaded file does not contain any student rows.',
      );
    }

    return rawRows.map<ParentApprovalInputRow>((row, index) => ({
      rowNumber: index + 2,
      studentName: this.normalizeCellValue(row[columnLookup.studentName]),
      fatherName: this.normalizeCellValue(row[columnLookup.fatherName]),
      parentPhone: this.normalizeCellValue(row[columnLookup.parentPhone]),
      email: this.normalizeCellValue(row[columnLookup.email]),
    }));
  }

  private validateParentApprovalRows(
    rows: ParentApprovalInputRow[] | SendAllParentApprovalStudentDto[],
    previouslySentEmails = new Set<string>(),
  ) {
    const normalizedRows = rows.map<NormalizedParentApprovalRow>(
      (row, index) => ({
        rowNumber: row.rowNumber ?? index + 2,
        studentName: this.normalizeCellValue(row.studentName),
        fatherName: this.normalizeCellValue(row.fatherName),
        parentPhone: this.normalizeCellValue(row.parentPhone),
        email: this.normalizeCellValue(row.email),
        normalizedPhone: this.normalizePhoneValue(row.parentPhone),
        normalizedEmail: this.normalizeEmailValue(row.email),
        validationStatus: 'valid',
        reasons: [],
      }),
    );

    const emailCounts = normalizedRows.reduce<Map<string, number>>(
      (map, row) => {
        if (!row.normalizedEmail) {
          return map;
        }

        map.set(row.normalizedEmail, (map.get(row.normalizedEmail) || 0) + 1);
        return map;
      },
      new Map(),
    );

    const rowsWithValidation = normalizedRows.map<NormalizedParentApprovalRow>(
      (row) => {
        const reasons: string[] = [];

        if (!row.studentName) {
          reasons.push('studentName is required.');
        }

        if (!row.fatherName) {
          reasons.push('fatherName is required.');
        }

        if (!row.normalizedPhone) {
          reasons.push('parentPhone is required.');
        } else if (!SAUDI_PHONE_PATTERN.test(row.normalizedPhone)) {
          reasons.push(
            'parentPhone must be a valid Saudi mobile number starting with 05 and 10 digits long.',
          );
        }

        if (!row.normalizedEmail) {
          reasons.push('email is required.');
        } else if (!isEmail(row.normalizedEmail)) {
          reasons.push('email must be a valid email address.');
        }

        if (
          row.normalizedEmail &&
          (emailCounts.get(row.normalizedEmail) || 0) > 1
        ) {
          reasons.push('This email is duplicated inside the uploaded file.');
        }

        if (
          row.normalizedEmail &&
          previouslySentEmails.has(row.normalizedEmail)
        ) {
          reasons.push(
            'An approval email was already sent to this email address for the selected trip.',
          );
        }

        return {
          ...row,
          parentPhone: row.normalizedPhone,
          email: row.normalizedEmail,
          validationStatus: reasons.length ? 'invalid' : 'valid',
          reasons,
        };
      },
    );

    const errors = rowsWithValidation
      .filter((row) => row.reasons.length)
      .map((row) => ({
        rowNumber: row.rowNumber,
        reasons: row.reasons,
      }));

    return {
      valid: errors.length === 0,
      rows: rowsWithValidation,
      errors,
      summary: {
        totalRows: rowsWithValidation.length,
        validRows: rowsWithValidation.length - errors.length,
        invalidRows: errors.length,
      },
    };
  }

  private async getPreviouslySentEmails(tripId: number, emails: string[]) {
    const normalizedEmails = Array.from(
      new Set(
        emails.map((email) => this.normalizeEmailValue(email)).filter(Boolean),
      ),
    );

    if (!normalizedEmails.length) {
      return new Set<string>();
    }

    const approvals = await this.prisma.trip_parent_approvals.findMany({
      where: {
        trip_id: BigInt(tripId),
        parent_email: { in: normalizedEmails },
        email_sent_at: { not: null },
      },
      select: {
        parent_email: true,
      },
    });

    return new Set(approvals.map((approval) => approval.parent_email));
  }

  private async ensureApprovalEmailWasNotSent(
    tripId: number,
    parentEmail: string,
  ) {
    const existingApproval = await this.prisma.trip_parent_approvals.findFirst({
      where: {
        trip_id: BigInt(tripId),
        parent_email: parentEmail,
        email_sent_at: { not: null },
      },
      select: { id: true },
    });

    if (existingApproval) {
      throw new BadRequestException(
        'An approval email was already sent to this email address for this trip.',
      );
    }
  }

  private async createParentApprovalRecord(input: {
    tripId: number | null;
    studentName: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
  }) {
    const approvalToken = await this.createUniqueApprovalToken();

    return this.prisma.trip_parent_approvals.create({
      data: {
        trip_id: input.tripId ? BigInt(input.tripId) : null,
        student_name: input.studentName,
        parent_name: input.parentName,
        parent_phone: input.parentPhone,
        parent_email: input.parentEmail,
        approval_status: 'pending',
        approval_token: approvalToken,
        email_sent_at: null,
        last_email_error: null,
      },
    });
  }

  private async sendApprovalEmailAndPersistStatus(
    approval: ParentApprovalPayload,
  ) {
    const mailResult = await this.sendParentApprovalEmail({
      parentEmail: approval.parent_email,
      parentName: approval.parent_name,
      studentName: approval.student_name,
      approvalLink: this.buildAbsoluteApprovalLink(approval.approval_token),
    });

    const updatedApproval = await this.prisma.trip_parent_approvals.update({
      where: { id: approval.id },
      data: {
        email_sent_at: mailResult.sent ? new Date() : null,
        last_email_error: mailResult.sent ? null : mailResult.error,
        updated_at: new Date(),
      },
    });

    return {
      approval: updatedApproval,
      sent: mailResult.sent,
      error: mailResult.error,
    };
  }

  private async dispatchParentApproval(
    tripId: number,
    row: NormalizedParentApprovalRow,
  ): Promise<{
    rowNumber: number;
    email: string;
    status: 'sent' | 'failed';
    error: string | null;
  }> {
    try {
      await this.ensureApprovalEmailWasNotSent(tripId, row.normalizedEmail);

      const approval = await this.createParentApprovalRecord({
        tripId,
        studentName: row.studentName,
        parentName: row.fatherName,
        parentPhone: row.normalizedPhone,
        parentEmail: row.normalizedEmail,
      });
      const mailResult = await this.sendApprovalEmailAndPersistStatus(approval);

      return {
        rowNumber: row.rowNumber,
        email: row.normalizedEmail,
        status: mailResult.sent ? 'sent' : 'failed',
        error: mailResult.sent ? null : mailResult.error,
      };
    } catch (error) {
      return {
        rowNumber: row.rowNumber,
        email: row.normalizedEmail,
        status: 'failed' as const,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send the approval email.',
      };
    }
  }

  private sendParentApprovalEmail(input: {
    parentEmail: string;
    parentName: string;
    studentName: string;
    approvalLink: string;
  }) {
    const text = [
      '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645\u060c',
      `\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0637\u0627\u0644\u0628 ${input.studentName} \u0641\u064a \u0631\u062d\u0644\u0629 \u0645\u062f\u0631\u0633\u064a\u0629.`,
      `\u064a\u0631\u062c\u0649 \u0645\u0646 \u0648\u0644\u064a \u0627\u0644\u0623\u0645\u0631 ${input.parentName} \u0627\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u062a\u0627\u0644\u064a \u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0623\u0648 \u0627\u0644\u0631\u0641\u0636:`,
      input.approvalLink,
    ].join('\n');

    return this.emailService.send({
      to: input.parentEmail,
      subject:
        '\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0631\u062d\u0644\u0629 \u0645\u062f\u0631\u0633\u064a\u0629',
      text,
      html: `
        <html lang="ar" dir="rtl">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta charset="UTF-8" />
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.8; direction: rtl; text-align: right;">
              <p>\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645\u060c</p>
              <p>\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0637\u0627\u0644\u0628 <strong>${this.escapeHtml(input.studentName)}</strong> \u0641\u064a \u0631\u062d\u0644\u0629 \u0645\u062f\u0631\u0633\u064a\u0629.</p>
              <p>\u064a\u0631\u062c\u0649 \u0645\u0646 \u0648\u0644\u064a \u0627\u0644\u0623\u0645\u0631 <strong>${this.escapeHtml(input.parentName)}</strong> \u0627\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u062a\u0627\u0644\u064a \u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0623\u0648 \u0627\u0644\u0631\u0641\u0636:</p>
              <p><a href="${this.escapeHtml(input.approvalLink)}">${this.escapeHtml(input.approvalLink)}</a></p>
            </div>
          </body>
        </html>
      `,
      fromName: 'Rahhal',
    });
  }

  private sendTrackingLinkEmail(input: {
    parentEmail: string;
    parentName: string;
    studentName: string;
    tripName: string;
    trackingLink: string;
  }) {
    const text = [
      'السلام عليكم،',
      `تم تحضير الطالب ${input.studentName} لرحلة ${input.tripName}.`,
      'يمكنكم متابعة حالة الرحلة والطالب عبر الرابط التالي:',
      input.trackingLink,
    ].join('\n');

    return this.emailService.send({
      to: input.parentEmail,
      subject: 'رابط تتبع الرحلة',
      text,
      html: `
        <html lang="ar" dir="rtl">
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.8; direction: rtl; text-align: right;">
              <p>السلام عليكم،</p>
              <p>تم تحضير الطالب <strong>${this.escapeHtml(input.studentName)}</strong> لرحلة <strong>${this.escapeHtml(input.tripName)}</strong>.</p>
              <p>يمكنكم متابعة حالة الرحلة والطالب عبر الرابط التالي:</p>
              <p><a href="${this.escapeHtml(input.trackingLink)}">${this.escapeHtml(input.trackingLink)}</a></p>
            </div>
          </body>
        </html>
      `,
      fromName: 'Rahhal',
    });
  }

  private sendAbsenceNotificationEmail(input: {
    parentEmail: string;
    parentName: string;
    studentName: string;
    tripName: string;
  }) {
    const text = [
      'السلام عليكم،',
      `نحيطكم علمًا بأن الطالب ${input.studentName} لم يحضر رحلة ${input.tripName}.`,
      'يرجى التواصل مع المدرسة عند الحاجة.',
    ].join('\n');

    return this.emailService.send({
      to: input.parentEmail,
      subject: 'إشعار غياب الطالب عن الرحلة',
      text,
      html: `
        <html lang="ar" dir="rtl">
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.8; direction: rtl; text-align: right;">
              <p>السلام عليكم،</p>
              <p>نحيطكم علمًا بأن الطالب <strong>${this.escapeHtml(input.studentName)}</strong> لم يحضر رحلة <strong>${this.escapeHtml(input.tripName)}</strong>.</p>
              <p>يرجى التواصل مع المدرسة عند الحاجة.</p>
            </div>
          </body>
        </html>
      `,
      fromName: 'Rahhal',
    });
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async create(
    dto: CreateSchoolTripDto,
    createdBy: number,
    permitFileUrl?: string | null,
  ) {
    if (!dto.destination_id) {
      throw new BadRequestException('destination_id is required');
    }
    if (!dto.place_id) {
      throw new BadRequestException('place_id is required');
    }
    if (!createdBy) {
      throw new BadRequestException('created_by is required');
    }
    if (!dto.school_name) {
      throw new BadRequestException('school_name is required');
    }

    this.ensureTripDatesAreValid(dto);

    const createRequestKey = this.buildCreateRequestKey(dto, createdBy);
    if (this.pendingCreateRequests.has(createRequestKey)) {
      throw new ConflictException(
        'يتم الآن إضافة الرحلة. فضلاً انتظر حتى يكتمل الطلب.',
      );
    }

    const destination = await this.prisma.destinations.findFirst({
      where: {
        id: BigInt(dto.destination_id),
        is_active: true,
      },
      select: { id: true },
    });

    if (!destination) {
      throw new BadRequestException(
        'destination_id does not exist or destination is not active',
      );
    }

    const place = await this.prisma.destination_places.findFirst({
      where: {
        id: BigInt(dto.place_id),
        destination_id: BigInt(dto.destination_id),
        is_active: true,
      },
      select: { id: true },
    });

    if (!place) {
      throw new BadRequestException(
        'place_id does not exist, is not active, or does not belong to destination_id',
      );
    }

    this.pendingCreateRequests.add(createRequestKey);

    try {
      await this.ensureNoRecentDuplicateTrip(dto, createdBy);

      const trip = await this.prisma.$transaction(async (tx) => {
        const createdTrip = await tx.trips.create({
          data: {
            title: dto.title,
            destination_id: BigInt(dto.destination_id),
            type: trips_type.school,
            description: dto.description ?? null,
            start_date: dto.start_date
              ? new Date(`${dto.start_date}T00:00:00.000Z`)
              : null,
            end_date: dto.end_date
              ? new Date(`${dto.end_date}T00:00:00.000Z`)
              : null,
            duration_days: dto.duration_days,
            price_per_person: null,
            max_participants: dto.max_participants ?? null,
            status: trips_status.draft,
            created_by: BigInt(createdBy),
            created_at: new Date(),
          },
        });

        await tx.school_trip_details.create({
          data: {
            trip_id: createdTrip.id,
            place_id: BigInt(dto.place_id),
            school_name: dto.school_name,
            education_level: dto.education_level,
            students_count: dto.students_count,
            supervisors_count: dto.supervisors_count,
            transport_type: dto.transport_type,
            meeting_point: dto.meeting_point,
            permit_file_url: permitFileUrl ?? null,
            notes: dto.notes ?? null,
            prep_progress: 12,
            is_ready: false,
          },
        });

        return tx.trips.findFirst({
          where: { id: createdTrip.id },
          include: {
            destinations: true,
            school_trip_details: { include: { destination_places: true } },
          },
        });
      });

      if (!trip) {
        throw new BadRequestException('Unable to create school trip');
      }

      return {
        ...this.mapTrip(trip),
        message: 'تم إضافة الرحلة بنجاح. انتظر الموافقة على الرحلة.',
      };
    } finally {
      this.pendingCreateRequests.delete(createRequestKey);
    }
  }

  async getById(id: number, currentUser?: SchoolTripsCurrentUser) {
    const trip = await this.getScopedTripOrThrow(id, currentUser);
    return this.mapTrip(trip);
  }

  async getTripReport(tripId: number, currentUser?: SchoolTripsCurrentUser) {
    const where = this.buildScopedTripsWhere(currentUser);
    const trip = await this.prisma.trips.findFirst({
      where: {
        ...where,
        id: BigInt(tripId),
      },
      include: {
        destinations: true,
        school_trip_details: { include: { destination_places: true } },
        trip_parent_approvals: {
          where: { trip_id: BigInt(tripId) },
          orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('School trip not found');
    }

    return this.mapTripReport(trip);
  }

  async list(currentUser?: SchoolTripsCurrentUser) {
    const trips = await this.prisma.trips.findMany({
      where: this.buildScopedTripsWhere(currentUser),
      include: {
        destinations: true,
        school_trip_details: { include: { destination_places: true } },
      },
      orderBy: { start_date: 'asc' },
    });

    return {
      count: trips.length,
      trips: trips.map((trip) => this.mapTrip(trip)),
    };
  }

  async getStats(currentUser?: SchoolTripsCurrentUser) {
    const baseWhere = this.buildScopedTripsWhere(currentUser);
    const today = new Date(new Date().toISOString().slice(0, 10));

    const upcomingTrips = await this.prisma.trips.count({
      where: {
        ...baseWhere,
        start_date: { gte: today },
        status: { in: [trips_status.open, trips_status.full] },
      },
    });

    const pastTrips = await this.prisma.trips.count({
      where: {
        ...baseWhere,
        end_date: { lt: today },
      },
    });

    const readyReports = await this.prisma.trips.count({
      where: { ...baseWhere, status: trips_status.completed },
    });

    const upcomingTripDetails = await this.prisma.trips.findMany({
      where: {
        ...baseWhere,
        start_date: { gte: today },
        status: { in: [trips_status.open, trips_status.full] },
      },
      select: {
        school_trip_details: {
          select: {
            students_count: true,
          },
        },
      },
    });

    const upcomingStudents = upcomingTripDetails.reduce(
      (sum, trip) =>
        sum + Number(trip.school_trip_details?.students_count ?? 0),
      0,
    );

    return {
      upcomingTrips,
      pastTrips,
      readyReports,
      upcomingStudents,
    };
  }

  async confirmPrep(tripId: number, currentUser?: SchoolTripsCurrentUser) {
    const trip = await this.getScopedTripOrThrow(tripId, currentUser);
    const details = trip.school_trip_details;

    if (!details) {
      throw new NotFoundException('School trip details not found');
    }

    await this.prisma.school_trip_details.update({
      where: { trip_id: BigInt(tripId) },
      data: {
        prep_progress: 100,
        is_ready: true,
      },
    });

    const refreshedTrip = await this.getScopedTripOrThrow(tripId, currentUser);
    return this.mapTrip(refreshedTrip);
  }

  private mapTripReport(trip: SchoolTripReportPayload) {
    const details = trip.school_trip_details;
    const destination = trip.destinations;
    const place = details?.destination_places;
    const students = trip.trip_parent_approvals.map((approval) => {
      const approvalStatus = approval.approval_status ?? 'pending';

      return {
        studentName: approval.student_name,
        parentName: approval.parent_name,
        parentPhone: approval.parent_phone,
        parentEmail: approval.parent_email,
        approvalStatus,
        approvedAt: approval.approved_at?.toISOString() ?? null,
      };
    });

    const approvalSummary = students.reduce(
      (acc, student) => {
        if (student.approvalStatus === 'approved') {
          acc.approvedCount += 1;
        } else if (student.approvalStatus === 'rejected') {
          acc.rejectedCount += 1;
        } else {
          acc.pendingRowsCount += 1;
        }

        return acc;
      },
      {
        approvedCount: 0,
        rejectedCount: 0,
        pendingRowsCount: 0,
      },
    );

    const totalStudents = Math.max(
      details?.students_count ?? 0,
      students.length,
    );
    const pendingCount = Math.max(
      totalStudents -
        approvalSummary.approvedCount -
        approvalSummary.rejectedCount,
      approvalSummary.pendingRowsCount,
    );
    const summary = {
      totalStudents,
      approvedCount: approvalSummary.approvedCount,
      pendingCount,
      rejectedCount: approvalSummary.rejectedCount,
    };

    return {
      trip: {
        id: trip.id.toString(),
        title: trip.title,
        startDate: trip.start_date?.toISOString().slice(0, 10) ?? null,
        endDate: trip.end_date?.toISOString().slice(0, 10) ?? null,
        destinationName: destination?.name ?? null,
        placeName: place?.name ?? null,
        schoolName: details?.school_name ?? null,
        educationLevel: details?.education_level ?? null,
        studentsCount: details?.students_count ?? 0,
        supervisorsCount: details?.supervisors_count ?? 0,
        transportType: details?.transport_type ?? null,
        meetingPoint: details?.meeting_point ?? null,
        notes: details?.notes ?? null,
      },
      students,
      summary,
    };
  }
}
