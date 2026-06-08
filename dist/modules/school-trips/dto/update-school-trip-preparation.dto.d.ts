export declare class UpdateStudentAttendanceDto {
    attendanceStatus: 'present' | 'absent';
}
export declare class UpdateSchoolTripLiveStatusDto {
    tripStatus?: 'created' | 'in_progress' | 'completed';
    supervisorNotes?: string;
}
