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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolTripsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const create_parent_approval_dto_1 = require("./dto/create-parent-approval.dto");
const create_school_trip_dto_1 = require("./dto/create-school-trip.dto");
const upload_parent_approvals_dto_1 = require("./dto/upload-parent-approvals.dto");
const update_school_trip_preparation_dto_1 = require("./dto/update-school-trip-preparation.dto");
const school_trips_service_1 = require("./school-trips.service");
const permitsDir = (0, path_1.join)(process.cwd(), 'uploads', 'permits');
function ensurePermitsDir() {
    if (!(0, fs_1.existsSync)(permitsDir)) {
        (0, fs_1.mkdirSync)(permitsDir, { recursive: true });
    }
}
function filename(_, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `permit-${unique}${(0, path_1.extname)(file.originalname)}`);
}
let SchoolTripsController = class SchoolTripsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, file, req) {
        const permitFileUrl = file ? `/uploads/permits/${file.filename}` : null;
        const createdBy = Number(req?.user?.userId ?? 0);
        return this.service.create(dto, createdBy, permitFileUrl);
    }
    uploadExcel(dto, file, req) {
        return this.service.uploadParentApprovalsFile(file, dto.tripId, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    sendAll(dto, req) {
        return this.service.sendAllParentApprovals(dto, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    getStats(req) {
        return this.service.getStats({
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    listRegions() {
        return this.service.listRegions();
    }
    listCities(region) {
        return this.service.listCities(region);
    }
    listPlaces(destinationId) {
        return this.service.listPlaces(destinationId);
    }
    listParentApprovals(tripId) {
        return this.service.listParentApprovals(tripId);
    }
    createParentApproval(dto) {
        return this.service.createParentApproval(dto);
    }
    getParentApprovalByToken(token) {
        return this.service.getParentApprovalByToken(token);
    }
    updateParentApprovalStatus(token, dto) {
        return this.service.updateParentApprovalStatus(token, dto.approvalStatus);
    }
    deleteParentApproval(id) {
        return this.service.deleteParentApproval(id);
    }
    confirmPrep(tripId, req) {
        return this.service.confirmPrep(tripId, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    getPreparation(tripId, req) {
        return this.service.getPreparation(tripId, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    updateTripLiveStatus(tripId, dto, req) {
        return this.service.updateTripLiveStatus(tripId, dto, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    sendTrackingLinks(tripId, req) {
        return this.service.sendTrackingLinks(tripId, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    updateStudentAttendance(tripId, approvalId, dto, req) {
        return this.service.updateStudentAttendance(tripId, approvalId, dto, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    getTripReport(tripId, req) {
        return this.service.getTripReport(tripId, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    getById(id, req) {
        return this.service.getById(id, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    list(req) {
        return this.service.list({
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    getTrackingByToken(token) {
        return this.service.getTrackingByToken(token);
    }
};
exports.SchoolTripsController = SchoolTripsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('permitFile', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                ensurePermitsDir();
                cb(null, permitsDir);
            },
            filename,
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_school_trip_dto_1.CreateSchoolTripDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-excel'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_parent_approvals_dto_1.UploadParentApprovalsDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "uploadExcel", null);
__decorate([
    (0, common_1.Post)('send-all'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_parent_approvals_dto_1.SendAllParentApprovalsDto, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "sendAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('regions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "listRegions", null);
__decorate([
    (0, common_1.Get)('cities'),
    __param(0, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "listCities", null);
__decorate([
    (0, common_1.Get)('places'),
    __param(0, (0, common_1.Query)('destinationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "listPlaces", null);
__decorate([
    (0, common_1.Get)('parent-approvals'),
    __param(0, (0, common_1.Query)('trip_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "listParentApprovals", null);
__decorate([
    (0, common_1.Post)('parent-approvals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parent_approval_dto_1.CreateParentApprovalDto]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "createParentApproval", null);
__decorate([
    (0, common_1.Get)('parent-approvals/token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getParentApprovalByToken", null);
__decorate([
    (0, common_1.Patch)('parent-approvals/token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_parent_approval_dto_1.UpdateParentApprovalStatusDto]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "updateParentApprovalStatus", null);
__decorate([
    (0, common_1.Delete)('parent-approvals/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "deleteParentApproval", null);
__decorate([
    (0, common_1.Patch)(':tripId/confirm-prep'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "confirmPrep", null);
__decorate([
    (0, common_1.Get)(':tripId/preparation'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getPreparation", null);
__decorate([
    (0, common_1.Patch)(':tripId/preparation/status'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_school_trip_preparation_dto_1.UpdateSchoolTripLiveStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "updateTripLiveStatus", null);
__decorate([
    (0, common_1.Post)(':tripId/preparation/send-tracking-links'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "sendTrackingLinks", null);
__decorate([
    (0, common_1.Patch)(':tripId/preparation/students/:approvalId'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('approvalId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_school_trip_preparation_dto_1.UpdateStudentAttendanceDto, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "updateStudentAttendance", null);
__decorate([
    (0, common_1.Get)(':tripId/report'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getTripReport", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('tracking/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SchoolTripsController.prototype, "getTrackingByToken", null);
exports.SchoolTripsController = SchoolTripsController = __decorate([
    (0, common_1.Controller)(['api/school-trips', 'trip']),
    __metadata("design:paramtypes", [school_trips_service_1.SchoolTripsService])
], SchoolTripsController);
//# sourceMappingURL=school-trips.controller.js.map