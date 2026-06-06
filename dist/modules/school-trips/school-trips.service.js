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
exports.SchoolTripsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../mail/email.service");
let SchoolTripsService = class SchoolTripsService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    regionLabels = {
        west: 'الغربية',
        east: 'الشرقية',
        north: 'الشمالية',
        south: 'الجنوبية',
        central: 'الوسطى',
    };
    isAdmin(role) {
        return typeof role === 'string' && role.trim().toLowerCase() === 'admin';
    }
    getRequesterId(currentUser) {
        if (currentUser?.userId === undefined ||
            currentUser?.userId === null ||
            currentUser?.userId === '') {
            return null;
        }
        try {
            return BigInt(currentUser.userId);
        }
        catch {
            return null;
        }
    }
    buildScopedTripsWhere(currentUser) {
        const where = {
            type: client_1.trips_type.school,
        };
        if (this.isAdmin(currentUser?.role)) {
            return where;
        }
        const requesterId = this.getRequesterId(currentUser);
        if (!requesterId) {
            throw new common_1.ForbiddenException('You are not allowed to access school trips');
        }
        where.created_by = requesterId;
        return where;
    }
    async getScopedTripOrThrow(tripId, currentUser) {
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
            throw new common_1.NotFoundException('School trip not found');
        }
        return trip;
    }
    mapTrip(trip) {
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
                    created_at: trip.school_trip_details.created_at,
                    updated_at: trip.school_trip_details.updated_at,
                    place: trip.school_trip_details.destination_places
                        ? {
                            id: trip.school_trip_details.destination_places.id.toString(),
                            destination_id: trip.school_trip_details.destination_places.destination_id.toString(),
                            name: trip.school_trip_details.destination_places.name,
                            type: trip.school_trip_details.destination_places.type,
                            description: trip.school_trip_details.destination_places.description,
                            image_url: trip.school_trip_details.destination_places.image_url,
                            is_active: trip.school_trip_details.destination_places.is_active,
                            created_at: trip.school_trip_details.destination_places.created_at,
                            updated_at: trip.school_trip_details.destination_places.updated_at,
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
    async listCities(region) {
        if (!region) {
            throw new common_1.BadRequestException('region is required');
        }
        const cities = await this.prisma.destinations.findMany({
            where: {
                region: region,
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
    async listPlaces(destinationId) {
        if (!destinationId || !/^\d+$/.test(destinationId)) {
            throw new common_1.BadRequestException('destinationId is required');
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
    async listParentApprovals(tripId) {
        try {
            const approvals = await this.prisma.trip_parent_approvals.findMany({
                where: tripId && /^\d+$/.test(tripId)
                    ? { trip_id: BigInt(tripId) }
                    : undefined,
                orderBy: { created_at: 'desc' },
            });
            return approvals.map((approval) => this.mapParentApproval(approval));
        }
        catch (error) {
            console.error('Failed to list parent approvals:', error);
            console.error(error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async createParentApproval(dto) {
        try {
            const approvalToken = await this.createUniqueApprovalToken();
            const approvalLink = `/parent-approval/${approvalToken}`;
            const fullApprovalLink = `${this.getFrontendUrl()}${approvalLink}`;
            const parentEmail = dto.parentEmail.trim().toLowerCase();
            const approval = await this.prisma.trip_parent_approvals.create({
                data: {
                    trip_id: dto.trip_id ? BigInt(dto.trip_id) : null,
                    student_name: dto.studentName.trim(),
                    parent_name: dto.parentName.trim(),
                    parent_phone: dto.parentPhone.trim(),
                    parent_email: parentEmail,
                    approval_status: 'pending',
                    approval_token: approvalToken,
                },
            });
            let mailResult = {
                sent: false,
                error: null,
            };
            try {
                mailResult = await this.sendParentApprovalEmail({
                    parentEmail,
                    parentName: approval.parent_name,
                    studentName: approval.student_name,
                    approvalLink: fullApprovalLink,
                });
                if (!mailResult.sent) {
                    console.error('Parent approval email failed:', mailResult.error);
                }
            }
            catch (emailError) {
                console.error('Parent approval email exception:', emailError);
                console.error(emailError instanceof Error ? emailError.stack : undefined);
                mailResult = {
                    sent: false,
                    error: emailError instanceof Error
                        ? emailError.message
                        : 'Unable to send parent approval email',
                };
            }
            return {
                ...this.mapParentApproval(approval),
                emailSent: mailResult.sent,
                emailError: mailResult.sent ? null : mailResult.error,
                message: mailResult.sent
                    ? 'Approval created and email sent'
                    : 'Approval created but email sending failed',
            };
        }
        catch (error) {
            console.error('Failed to create parent approval:', error);
            console.error(error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async deleteParentApproval(id) {
        await this.prisma.trip_parent_approvals.delete({
            where: { id: BigInt(id) },
        });
        return { ok: true };
    }
    async getParentApprovalByToken(token) {
        const approval = await this.prisma.trip_parent_approvals.findUnique({
            where: { approval_token: token },
        });
        if (!approval) {
            throw new common_1.NotFoundException('Parent approval not found');
        }
        return this.mapParentApproval(approval);
    }
    async updateParentApprovalStatus(token, approvalStatus) {
        const approval = await this.prisma.trip_parent_approvals.update({
            where: { approval_token: token },
            data: {
                approval_status: approvalStatus,
                approved_at: approvalStatus === 'approved' ? new Date() : null,
                updated_at: new Date(),
            },
        });
        return this.mapParentApproval(approval);
    }
    mapParentApproval(approval) {
        const approvalLink = `/parent-approval/${approval.approval_token}`;
        return {
            id: approval.id.toString(),
            tripId: approval.trip_id?.toString() ?? null,
            tripName: 'رحلة مدرسية',
            studentName: approval.student_name,
            parentName: approval.parent_name,
            parentPhone: approval.parent_phone,
            parentEmail: approval.parent_email,
            approvalStatus: approval.approval_status || 'pending',
            approvalToken: approval.approval_token,
            approvalLink,
            approvedAt: approval.approved_at,
            createdAt: approval.created_at,
            updatedAt: approval.updated_at,
        };
    }
    async createUniqueApprovalToken() {
        let token = (0, crypto_1.randomBytes)(18).toString('hex');
        while (await this.prisma.trip_parent_approvals.findUnique({
            where: { approval_token: token },
            select: { id: true },
        })) {
            token = (0, crypto_1.randomBytes)(18).toString('hex');
        }
        return token;
    }
    getFrontendUrl() {
        return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    }
    sendParentApprovalEmail(input) {
        const text = [
            'السلام عليكم،',
            `تم تسجيل الطالب ${input.studentName} في رحلة مدرسية.`,
            `يرجى من ولي الأمر ${input.parentName} الضغط على الرابط التالي لإرسال الموافقة أو الرفض:`,
            input.approvalLink,
        ].join('\n');
        return this.emailService.send({
            to: input.parentEmail,
            subject: 'موافقة على رحلة مدرسية',
            text,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.8; direction: rtl;">
          <p>السلام عليكم،</p>
          <p>تم تسجيل الطالب <strong>${this.escapeHtml(input.studentName)}</strong> في رحلة مدرسية.</p>
          <p>يرجى من ولي الأمر <strong>${this.escapeHtml(input.parentName)}</strong> الضغط على الرابط التالي لإرسال الموافقة أو الرفض:</p>
          <p><a href="${this.escapeHtml(input.approvalLink)}">${this.escapeHtml(input.approvalLink)}</a></p>
        </div>
      `,
            fromName: 'Rahhal',
        });
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    async create(dto, createdBy, permitFileUrl) {
        if (!dto.destination_id) {
            throw new common_1.BadRequestException('destination_id is required');
        }
        if (!dto.place_id) {
            throw new common_1.BadRequestException('place_id is required');
        }
        if (!createdBy) {
            throw new common_1.BadRequestException('created_by is required');
        }
        if (!dto.school_name) {
            throw new common_1.BadRequestException('school_name is required');
        }
        const destination = await this.prisma.destinations.findFirst({
            where: {
                id: BigInt(dto.destination_id),
                is_active: true,
            },
            select: { id: true },
        });
        if (!destination) {
            throw new common_1.BadRequestException('destination_id does not exist or destination is not active');
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
            throw new common_1.BadRequestException('place_id does not exist, is not active, or does not belong to destination_id');
        }
        const trip = await this.prisma.$transaction(async (tx) => {
            const createdTrip = await tx.trips.create({
                data: {
                    title: dto.title,
                    destination_id: BigInt(dto.destination_id),
                    type: client_1.trips_type.school,
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
                    status: client_1.trips_status.draft,
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
            throw new common_1.BadRequestException('Unable to create school trip');
        }
        return this.mapTrip(trip);
    }
    async getById(id, currentUser) {
        const trip = await this.getScopedTripOrThrow(id, currentUser);
        return this.mapTrip(trip);
    }
    async getTripReport(tripId, currentUser) {
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
            throw new common_1.NotFoundException('School trip not found');
        }
        return this.mapTripReport(trip);
    }
    async list(currentUser) {
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
    async getStats(currentUser) {
        const baseWhere = this.buildScopedTripsWhere(currentUser);
        const today = new Date(new Date().toISOString().slice(0, 10));
        const upcomingTrips = await this.prisma.trips.count({
            where: {
                ...baseWhere,
                start_date: { gte: today },
                status: { in: [client_1.trips_status.open, client_1.trips_status.full] },
            },
        });
        const pastTrips = await this.prisma.trips.count({
            where: {
                ...baseWhere,
                end_date: { lt: today },
            },
        });
        const readyReports = await this.prisma.trips.count({
            where: { ...baseWhere, status: client_1.trips_status.completed },
        });
        const upcomingTripDetails = await this.prisma.trips.findMany({
            where: {
                ...baseWhere,
                start_date: { gte: today },
                status: { in: [client_1.trips_status.open, client_1.trips_status.full] },
            },
            select: {
                school_trip_details: {
                    select: {
                        students_count: true,
                    },
                },
            },
        });
        const upcomingStudents = upcomingTripDetails.reduce((sum, trip) => sum + Number(trip.school_trip_details?.students_count ?? 0), 0);
        return {
            upcomingTrips,
            pastTrips,
            readyReports,
            upcomingStudents,
        };
    }
    async confirmPrep(tripId, currentUser) {
        const trip = await this.getScopedTripOrThrow(tripId, currentUser);
        const details = trip.school_trip_details;
        if (!details) {
            throw new common_1.NotFoundException('School trip details not found');
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
    mapTripReport(trip) {
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
        const approvalSummary = students.reduce((acc, student) => {
            if (student.approvalStatus === 'approved') {
                acc.approvedCount += 1;
            }
            else if (student.approvalStatus === 'rejected') {
                acc.rejectedCount += 1;
            }
            else {
                acc.pendingRowsCount += 1;
            }
            return acc;
        }, {
            approvedCount: 0,
            rejectedCount: 0,
            pendingRowsCount: 0,
        });
        const totalStudents = Math.max(details?.students_count ?? 0, students.length);
        const pendingCount = Math.max(totalStudents -
            approvalSummary.approvedCount -
            approvalSummary.rejectedCount, approvalSummary.pendingRowsCount);
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
};
exports.SchoolTripsService = SchoolTripsService;
exports.SchoolTripsService = SchoolTripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], SchoolTripsService);
//# sourceMappingURL=school-trips.service.js.map