import { AdminApprovalsService } from './admin-approvals.service';
import { AdminApprovalsQueryDto } from './dto/admin-approvals-query.dto';
import { RejectApprovalDto } from './dto/reject-approval.dto';
export declare class AdminApprovalsController {
    private readonly service;
    constructor(service: AdminApprovalsService);
    list(query: AdminApprovalsQueryDto, req?: {
        user?: {
            userId?: string;
            role?: string;
        };
    }): Promise<{
        count: number;
        summary: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
        };
        items: {
            id: string;
            tripTitle: string;
            city: string;
            organizer: string;
            date: string | null;
            people: number;
            price: number | null;
            submittedAt: string;
            status: import("./dto/admin-approvals-query.dto").ApprovalStatus;
            note: string;
            isSchoolTrip: boolean;
            isGroupTrip: boolean;
            hasDocuments: boolean;
            permitFileUrl: string | null;
            rejectedReason: string;
            dbStatus: import(".prisma/client").$Enums.trips_status;
            type: import(".prisma/client").$Enums.trips_type;
            destinationId: string;
            createdBy: string;
            reviewedBy: string | null;
            reviewedAt: string | null;
        }[];
    }>;
    approve(id: number, req?: {
        user?: {
            userId?: string;
        };
    }): Promise<{
        id: string;
        tripTitle: string;
        city: string;
        organizer: string;
        date: string | null;
        people: number;
        price: number | null;
        submittedAt: string;
        status: import("./dto/admin-approvals-query.dto").ApprovalStatus;
        note: string;
        isSchoolTrip: boolean;
        isGroupTrip: boolean;
        hasDocuments: boolean;
        permitFileUrl: string | null;
        rejectedReason: string;
        dbStatus: import(".prisma/client").$Enums.trips_status;
        type: import(".prisma/client").$Enums.trips_type;
        destinationId: string;
        createdBy: string;
        reviewedBy: string | null;
        reviewedAt: string | null;
    }>;
    reject(id: number, dto: RejectApprovalDto, req?: {
        user?: {
            userId?: string;
        };
    }): Promise<{
        id: string;
        tripTitle: string;
        city: string;
        organizer: string;
        date: string | null;
        people: number;
        price: number | null;
        submittedAt: string;
        status: import("./dto/admin-approvals-query.dto").ApprovalStatus;
        note: string;
        isSchoolTrip: boolean;
        isGroupTrip: boolean;
        hasDocuments: boolean;
        permitFileUrl: string | null;
        rejectedReason: string;
        dbStatus: import(".prisma/client").$Enums.trips_status;
        type: import(".prisma/client").$Enums.trips_type;
        destinationId: string;
        createdBy: string;
        reviewedBy: string | null;
        reviewedAt: string | null;
    }>;
}
