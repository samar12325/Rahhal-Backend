import { CreateParentApprovalDto, UpdateParentApprovalStatusDto } from './dto/create-parent-approval.dto';
import { CreateSchoolTripDto } from './dto/create-school-trip.dto';
import { SendAllParentApprovalsDto, UploadParentApprovalsDto } from './dto/upload-parent-approvals.dto';
import { UpdateSchoolTripLiveStatusDto, UpdateStudentAttendanceDto } from './dto/update-school-trip-preparation.dto';
import { SchoolTripsService } from './school-trips.service';
import type { RequestWithAuthCookies } from '../../common/types/authenticated-request.type';
export declare class SchoolTripsController {
    private readonly service;
    constructor(service: SchoolTripsService);
    create(dto: CreateSchoolTripDto, file?: Express.Multer.File, req?: RequestWithAuthCookies): Promise<{
        message: string;
        id: string;
        title: string;
        destination_id: string;
        type: import(".prisma/client").$Enums.trips_type;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: import(".prisma/client").$Enums.trips_status;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
        school_details: {
            trip_id: string;
            place_id: string | null;
            school_name: string;
            education_level: string | null;
            students_count: number;
            supervisors_count: number;
            transport_type: string | null;
            meeting_point: string | null;
            permit_file_url: string | null;
            notes: string | null;
            prep_progress: number;
            is_ready: boolean;
            trip_live_status: import(".prisma/client").$Enums.school_trip_live_status;
            departure_time: Date | null;
            return_time: Date | null;
            supervisor_notes: string | null;
            tracking_last_updated_at: Date | null;
            created_at: Date;
            updated_at: Date | null;
            place: {
                id: string;
                destination_id: string;
                name: string;
                type: string | null;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        } | null;
    }>;
    uploadExcel(dto: UploadParentApprovalsDto, file: Express.Multer.File | undefined, req?: RequestWithAuthCookies): Promise<{
        valid: boolean;
        rows: {
            rowNumber: number;
            studentName: string;
            fatherName: string;
            parentPhone: string;
            email: string;
            validationStatus: "valid" | "invalid";
            reasons: string[];
        }[];
        errors: {
            rowNumber: number;
            reasons: string[];
        }[];
        summary: {
            totalRows: number;
            validRows: number;
            invalidRows: number;
        };
    }>;
    sendAll(dto: SendAllParentApprovalsDto, req?: RequestWithAuthCookies): Promise<{
        results: {
            rowNumber: number;
            email: string;
            status: "sent" | "failed";
            error: string | null;
        }[];
        summary: {
            total: number;
            sent: number;
            failed: number;
        };
    }>;
    getStats(req?: RequestWithAuthCookies): Promise<{
        upcomingTrips: number;
        pastTrips: number;
        readyReports: number;
        upcomingStudents: number;
    }>;
    listRegions(): Promise<{
        value: import(".prisma/client").$Enums.destinations_region;
        label: string;
    }[]>;
    listCities(region: string): Promise<{
        id: string;
        name: string;
        region: import(".prisma/client").$Enums.destinations_region;
    }[]>;
    listPlaces(destinationId: string): Promise<{
        id: string;
        name: string;
        type: string | null;
        description: string | null;
        image_url: string | null;
    }[]>;
    listParentApprovals(tripId?: string): Promise<{
        id: string;
        tripId: string | null;
        tripName: string;
        studentName: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
        attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
        attendanceMarkedAt: Date | null;
        attendanceMarkedByName: string | null;
        approvalToken: string;
        approvalLink: string;
        trackingToken: string | null;
        trackingLink: string | null;
        trackingLinkSentAt: Date | null;
        approvedAt: Date | null;
        emailSentAt: Date | null;
        lastEmailError: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    createParentApproval(dto: CreateParentApprovalDto): Promise<{
        emailSent: boolean;
        emailError: string | null;
        message: string;
        id: string;
        tripId: string | null;
        tripName: string;
        studentName: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
        attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
        attendanceMarkedAt: Date | null;
        attendanceMarkedByName: string | null;
        approvalToken: string;
        approvalLink: string;
        trackingToken: string | null;
        trackingLink: string | null;
        trackingLinkSentAt: Date | null;
        approvedAt: Date | null;
        emailSentAt: Date | null;
        lastEmailError: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getParentApprovalByToken(token: string): Promise<{
        id: string;
        tripId: string | null;
        tripName: string;
        studentName: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
        attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
        attendanceMarkedAt: Date | null;
        attendanceMarkedByName: string | null;
        approvalToken: string;
        approvalLink: string;
        trackingToken: string | null;
        trackingLink: string | null;
        trackingLinkSentAt: Date | null;
        approvedAt: Date | null;
        emailSentAt: Date | null;
        lastEmailError: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updateParentApprovalStatus(token: string, dto: UpdateParentApprovalStatusDto): Promise<{
        id: string;
        tripId: string | null;
        tripName: string;
        studentName: string;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
        attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
        attendanceMarkedAt: Date | null;
        attendanceMarkedByName: string | null;
        approvalToken: string;
        approvalLink: string;
        trackingToken: string | null;
        trackingLink: string | null;
        trackingLinkSentAt: Date | null;
        approvedAt: Date | null;
        emailSentAt: Date | null;
        lastEmailError: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deleteParentApproval(id: number): Promise<{
        ok: boolean;
    }>;
    confirmPrep(tripId: number, req?: RequestWithAuthCookies): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: import(".prisma/client").$Enums.trips_type;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: import(".prisma/client").$Enums.trips_status;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
        school_details: {
            trip_id: string;
            place_id: string | null;
            school_name: string;
            education_level: string | null;
            students_count: number;
            supervisors_count: number;
            transport_type: string | null;
            meeting_point: string | null;
            permit_file_url: string | null;
            notes: string | null;
            prep_progress: number;
            is_ready: boolean;
            trip_live_status: import(".prisma/client").$Enums.school_trip_live_status;
            departure_time: Date | null;
            return_time: Date | null;
            supervisor_notes: string | null;
            tracking_last_updated_at: Date | null;
            created_at: Date;
            updated_at: Date | null;
            place: {
                id: string;
                destination_id: string;
                name: string;
                type: string | null;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        } | null;
    }>;
    getPreparation(tripId: number, req?: RequestWithAuthCookies): Promise<{
        trip: {
            id: string;
            title: string;
            destinationName: string;
            placeName: string | null;
            educationLevel: string | null;
            liveStatus: import(".prisma/client").$Enums.school_trip_live_status;
            departureTime: string | null;
            returnTime: string | null;
            supervisorNotes: string;
            lastUpdated: string | null;
        };
        counters: {
            totalApproved: number;
            present: number;
            absent: number;
            unprepared: number;
        };
        students: {
            id: string;
            studentName: string;
            grade: string | null;
            approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
            attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
            attendanceTime: string | null;
            supervisorName: string | null;
            trackingLinkSentAt: string | null;
        }[];
    }>;
    updateTripLiveStatus(tripId: number, dto: UpdateSchoolTripLiveStatusDto, req?: RequestWithAuthCookies): Promise<{
        trip: {
            id: string;
            title: string;
            destinationName: string;
            placeName: string | null;
            educationLevel: string | null;
            liveStatus: import(".prisma/client").$Enums.school_trip_live_status;
            departureTime: string | null;
            returnTime: string | null;
            supervisorNotes: string;
            lastUpdated: string | null;
        };
        counters: {
            totalApproved: number;
            present: number;
            absent: number;
            unprepared: number;
        };
        students: {
            id: string;
            studentName: string;
            grade: string | null;
            approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
            attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
            attendanceTime: string | null;
            supervisorName: string | null;
            trackingLinkSentAt: string | null;
        }[];
    }>;
    sendTrackingLinks(tripId: number, req?: RequestWithAuthCookies): Promise<{
        sent: number;
        failed: number;
        skipped: number;
    }>;
    updateStudentAttendance(tripId: number, approvalId: number, dto: UpdateStudentAttendanceDto, req?: RequestWithAuthCookies): Promise<{
        trip: {
            id: string;
            title: string;
            destinationName: string;
            placeName: string | null;
            educationLevel: string | null;
            liveStatus: import(".prisma/client").$Enums.school_trip_live_status;
            departureTime: string | null;
            returnTime: string | null;
            supervisorNotes: string;
            lastUpdated: string | null;
        };
        counters: {
            totalApproved: number;
            present: number;
            absent: number;
            unprepared: number;
        };
        students: {
            id: string;
            studentName: string;
            grade: string | null;
            approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
            attendanceStatus: import(".prisma/client").$Enums.student_attendance_status;
            attendanceTime: string | null;
            supervisorName: string | null;
            trackingLinkSentAt: string | null;
        }[];
    }>;
    getTripReport(tripId: number, req?: RequestWithAuthCookies): Promise<{
        trip: {
            id: string;
            title: string;
            startDate: string | null;
            endDate: string | null;
            destinationName: string;
            placeName: string | null;
            schoolName: string | null;
            educationLevel: string | null;
            studentsCount: number;
            supervisorsCount: number;
            transportType: string | null;
            meetingPoint: string | null;
            notes: string | null;
        };
        students: {
            studentName: string;
            parentName: string;
            parentPhone: string;
            parentEmail: string;
            approvalStatus: import(".prisma/client").$Enums.parent_approval_status;
            approvedAt: string | null;
        }[];
        summary: {
            totalStudents: number;
            approvedCount: number;
            pendingCount: number;
            rejectedCount: number;
        };
    }>;
    getById(id: number, req?: RequestWithAuthCookies): Promise<{
        id: string;
        title: string;
        destination_id: string;
        type: import(".prisma/client").$Enums.trips_type;
        description: string | null;
        start_date: string | null;
        end_date: string | null;
        duration_days: number | null;
        price_per_person: string | null;
        max_participants: number | null;
        status: import(".prisma/client").$Enums.trips_status;
        created_by: string;
        created_at: Date;
        updated_at: Date | null;
        destination: {
            id: string;
            name: string;
            region: import(".prisma/client").$Enums.destinations_region;
            description: string | null;
            image_url: string | null;
            is_active: boolean;
            created_at: Date;
            updated_at: Date | null;
        } | undefined;
        school_details: {
            trip_id: string;
            place_id: string | null;
            school_name: string;
            education_level: string | null;
            students_count: number;
            supervisors_count: number;
            transport_type: string | null;
            meeting_point: string | null;
            permit_file_url: string | null;
            notes: string | null;
            prep_progress: number;
            is_ready: boolean;
            trip_live_status: import(".prisma/client").$Enums.school_trip_live_status;
            departure_time: Date | null;
            return_time: Date | null;
            supervisor_notes: string | null;
            tracking_last_updated_at: Date | null;
            created_at: Date;
            updated_at: Date | null;
            place: {
                id: string;
                destination_id: string;
                name: string;
                type: string | null;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | null;
        } | null;
    }>;
    list(req?: RequestWithAuthCookies): Promise<{
        count: number;
        trips: {
            id: string;
            title: string;
            destination_id: string;
            type: import(".prisma/client").$Enums.trips_type;
            description: string | null;
            start_date: string | null;
            end_date: string | null;
            duration_days: number | null;
            price_per_person: string | null;
            max_participants: number | null;
            status: import(".prisma/client").$Enums.trips_status;
            created_by: string;
            created_at: Date;
            updated_at: Date | null;
            destination: {
                id: string;
                name: string;
                region: import(".prisma/client").$Enums.destinations_region;
                description: string | null;
                image_url: string | null;
                is_active: boolean;
                created_at: Date;
                updated_at: Date | null;
            } | undefined;
            school_details: {
                trip_id: string;
                place_id: string | null;
                school_name: string;
                education_level: string | null;
                students_count: number;
                supervisors_count: number;
                transport_type: string | null;
                meeting_point: string | null;
                permit_file_url: string | null;
                notes: string | null;
                prep_progress: number;
                is_ready: boolean;
                trip_live_status: import(".prisma/client").$Enums.school_trip_live_status;
                departure_time: Date | null;
                return_time: Date | null;
                supervisor_notes: string | null;
                tracking_last_updated_at: Date | null;
                created_at: Date;
                updated_at: Date | null;
                place: {
                    id: string;
                    destination_id: string;
                    name: string;
                    type: string | null;
                    description: string | null;
                    image_url: string | null;
                    is_active: boolean;
                    created_at: Date;
                    updated_at: Date | null;
                } | null;
            } | null;
        }[];
    }>;
    getTrackingByToken(token: string): Promise<{
        tripName: string;
        studentName: string;
        grade: string | null;
        studentStatus: import(".prisma/client").$Enums.student_attendance_status;
        tripStatus: import(".prisma/client").$Enums.school_trip_live_status;
        departureTime: string | null;
        returnTime: string | null;
        lastUpdated: string | null;
        supervisorNotes: string;
        attendanceTime: string | null;
    }>;
}
