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
exports.AdminApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const admin_approvals_query_dto_1 = require("./dto/admin-approvals-query.dto");
let AdminApprovalsService = class AdminApprovalsService {
    prisma;
    tripInclude = {
        destinations: true,
        users: { select: { id: true, name: true } },
        group_trip_details: {
            include: { users: { select: { id: true, name: true } } },
        },
        school_trip_details: true,
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query, currentUser) {
        const where = this.buildWhere(query, currentUser);
        const trips = await this.prisma.trips.findMany({
            where,
            include: this.tripInclude,
            orderBy: { created_at: 'desc' },
        });
        const items = trips.map((trip) => this.mapTrip(trip));
        const summary = items.reduce((acc, item) => {
            acc.total += 1;
            if (item.status === admin_approvals_query_dto_1.ApprovalStatus.approved)
                acc.approved += 1;
            if (item.status === admin_approvals_query_dto_1.ApprovalStatus.pending)
                acc.pending += 1;
            if (item.status === admin_approvals_query_dto_1.ApprovalStatus.rejected)
                acc.rejected += 1;
            return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
        return { count: items.length, summary, items };
    }
    async approve(id, reviewerId) {
        const reviewer = this.ensureReviewer(reviewerId);
        await this.ensureTripExists(id);
        const updated = await this.prisma.trips.update({
            where: { id: BigInt(id) },
            data: {
                status: client_1.trips_status.open,
                reviewed_by: reviewer,
                reviewed_at: new Date(),
                rejection_reason: null,
                updated_at: new Date(),
            },
            include: this.tripInclude,
        });
        return this.mapTrip(updated);
    }
    async reject(id, reviewerId, reason) {
        const reviewer = this.ensureReviewer(reviewerId);
        if (!reason || reason.trim().length < 2) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        await this.ensureTripExists(id);
        const updated = await this.prisma.trips.update({
            where: { id: BigInt(id) },
            data: {
                status: client_1.trips_status.cancelled,
                reviewed_by: reviewer,
                reviewed_at: new Date(),
                rejection_reason: reason.trim(),
                updated_at: new Date(),
            },
            include: this.tripInclude,
        });
        return this.mapTrip(updated);
    }
    buildWhere(query, currentUser) {
        const where = {
            type: { in: [client_1.trips_type.group, client_1.trips_type.school] },
        };
        if (!this.isAdmin(currentUser.role)) {
            where.created_by = BigInt(currentUser.userId);
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.status === admin_approvals_query_dto_1.ApprovalStatus.pending) {
            where.status = client_1.trips_status.draft;
        }
        else if (query.status === admin_approvals_query_dto_1.ApprovalStatus.rejected) {
            where.status = client_1.trips_status.cancelled;
        }
        else if (query.status === admin_approvals_query_dto_1.ApprovalStatus.approved) {
            where.status = {
                in: [client_1.trips_status.open, client_1.trips_status.full, client_1.trips_status.completed],
            };
        }
        else {
            where.status = {
                in: [
                    client_1.trips_status.draft,
                    client_1.trips_status.open,
                    client_1.trips_status.full,
                    client_1.trips_status.completed,
                    client_1.trips_status.cancelled,
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
    isAdmin(role) {
        return role?.trim().toLowerCase() === 'admin';
    }
    mapTrip(trip) {
        const isSchoolTrip = trip.type === client_1.trips_type.school;
        const isGroupTrip = trip.type === client_1.trips_type.group;
        const organizerName = isSchoolTrip
            ? (trip.school_trip_details?.school_name ?? trip.users?.name ?? '')
            : (trip.group_trip_details?.users?.name ?? trip.users?.name ?? '');
        const people = isSchoolTrip
            ? (trip.school_trip_details?.students_count ?? trip.max_participants ?? 0)
            : (trip.max_participants ??
                trip.group_trip_details?.required_participants ??
                0);
        const price = trip.price_per_person !== null && trip.price_per_person !== undefined
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
    mapApprovalStatus(status) {
        if (status === client_1.trips_status.cancelled)
            return admin_approvals_query_dto_1.ApprovalStatus.rejected;
        if (status === client_1.trips_status.open ||
            status === client_1.trips_status.full ||
            status === client_1.trips_status.completed) {
            return admin_approvals_query_dto_1.ApprovalStatus.approved;
        }
        return admin_approvals_query_dto_1.ApprovalStatus.pending;
    }
    ensureReviewer(reviewerId) {
        if (!Number.isFinite(reviewerId) || reviewerId <= 0) {
            throw new common_1.BadRequestException('Invalid reviewer');
        }
        return BigInt(reviewerId);
    }
    async ensureTripExists(id) {
        const trip = await this.prisma.trips.findFirst({
            where: {
                id: BigInt(id),
                type: { in: [client_1.trips_type.group, client_1.trips_type.school] },
            },
            select: { id: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip request not found');
        }
    }
};
exports.AdminApprovalsService = AdminApprovalsService;
exports.AdminApprovalsService = AdminApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminApprovalsService);
//# sourceMappingURL=admin-approvals.service.js.map