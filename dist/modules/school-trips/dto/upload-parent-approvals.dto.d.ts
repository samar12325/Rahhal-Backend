export declare class UploadParentApprovalsDto {
    tripId: number;
}
export declare class SendAllParentApprovalStudentDto {
    rowNumber?: number;
    studentName: string;
    fatherName: string;
    parentPhone: string;
    email: string;
}
export declare class SendAllParentApprovalsDto {
    tripId: number;
    students: SendAllParentApprovalStudentDto[];
}
