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
exports.GroupTripsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs_1 = require("fs");
const path_1 = require("path");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const create_group_trip_dto_1 = require("./dto/create-group-trip.dto");
const list_group_trips_dto_1 = require("./dto/list-group-trips.dto");
const group_trips_service_1 = require("./group-trips.service");
const groupTripImagesDir = (0, path_1.join)(process.cwd(), 'uploads', 'group-trips');
const fallbackLogoName = 'rahhal-logo.png';
const fallbackLogoPath = (0, path_1.join)(groupTripImagesDir, fallbackLogoName);
const fallbackLogoSourcePath = (0, path_1.join)(process.cwd(), '..', 'Rahal', 'src', 'assets', 'images', 'rahhal-logo.png');
function ensureGroupTripImagesDir() {
    if (!(0, fs_1.existsSync)(groupTripImagesDir)) {
        (0, fs_1.mkdirSync)(groupTripImagesDir, { recursive: true });
    }
}
function ensureFallbackLogo() {
    ensureGroupTripImagesDir();
    if (!(0, fs_1.existsSync)(fallbackLogoPath) && (0, fs_1.existsSync)(fallbackLogoSourcePath)) {
        (0, fs_1.copyFileSync)(fallbackLogoSourcePath, fallbackLogoPath);
    }
}
function filename(_, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `group-trip-${unique}${(0, path_1.extname)(file.originalname) || '.png'}`);
}
let GroupTripsController = class GroupTripsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getApiBaseUrl(req) {
        const forwardedProto = req?.headers?.['x-forwarded-proto'];
        const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
            req?.protocol ||
            'http';
        const host = req?.get?.('host') || `localhost:${process.env.PORT || 3000}`;
        return `${protocol}://${host}`.replace(/\/$/, '');
    }
    buildPublicUrl(req, path) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.getApiBaseUrl(req)}${normalizedPath}`;
    }
    getDefaultImageUrl(req) {
        ensureFallbackLogo();
        if ((0, fs_1.existsSync)(fallbackLogoPath)) {
            return this.buildPublicUrl(req, `/uploads/group-trips/${fallbackLogoName}`);
        }
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
        return `${frontendUrl}/src/assets/images/rahhal-logo.png`;
    }
    list(q) {
        return this.service.list(q);
    }
    listAvailable(q) {
        return this.service.listAvailable(q);
    }
    listPast(q) {
        return this.service.listPast(q);
    }
    getById(id) {
        return this.service.getById(id);
    }
    getParticipants(id, req) {
        return this.service.getParticipants(id, {
            userId: req?.user?.userId,
            role: req?.user?.role,
        });
    }
    create(dto, file, req) {
        const createdBy = Number(req?.user?.userId ?? 0);
        const uploadedImageUrl = file
            ? this.buildPublicUrl(req, `/uploads/group-trips/${file.filename}`)
            : null;
        return this.service.create(dto, createdBy, uploadedImageUrl, this.getDefaultImageUrl(req));
    }
};
exports.GroupTripsController = GroupTripsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_group_trips_dto_1.ListGroupTripsDto]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_group_trips_dto_1.ListGroupTripsDto]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "listAvailable", null);
__decorate([
    (0, common_1.Get)('past'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_group_trips_dto_1.ListGroupTripsDto]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "listPast", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/participants'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imageFile', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                ensureGroupTripImagesDir();
                ensureFallbackLogo();
                cb(null, groupTripImagesDir);
            },
            filename,
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_trip_dto_1.CreateGroupTripDto, Object, Object]),
    __metadata("design:returntype", void 0)
], GroupTripsController.prototype, "create", null);
exports.GroupTripsController = GroupTripsController = __decorate([
    (0, common_1.Controller)('api/group-trips'),
    __metadata("design:paramtypes", [group_trips_service_1.GroupTripsService])
], GroupTripsController);
//# sourceMappingURL=group-trips.controller.js.map