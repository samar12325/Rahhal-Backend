import { trips_type } from '@prisma/client';
export declare enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export declare class AdminApprovalsQueryDto {
    type?: trips_type;
    status?: ApprovalStatus;
    q?: string;
}
