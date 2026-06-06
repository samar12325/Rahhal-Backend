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
exports.AdminTripsController = void 0;
const common_1 = require("@nestjs/common");
const admin_trips_service_1 = require("./admin-trips.service");
const admin_trips_query_dto_1 = require("./dto/admin-trips-query.dto");
const create_admin_trip_dto_1 = require("./dto/create-admin-trip.dto");
const update_admin_trip_dto_1 = require("./dto/update-admin-trip.dto");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminTripsController = class AdminTripsController {
    adminTripsService;
    constructor(adminTripsService) {
        this.adminTripsService = adminTripsService;
    }
    list(query) {
        return this.adminTripsService.list(query);
    }
    create(dto) {
        return this.adminTripsService.create(dto);
    }
    update(id, dto) {
        return this.adminTripsService.update(id, dto);
    }
    delete(id) {
        return this.adminTripsService.delete(id);
    }
};
exports.AdminTripsController = AdminTripsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_trips_query_dto_1.AdminTripsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminTripsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_trip_dto_1.CreateAdminTripDto]),
    __metadata("design:returntype", void 0)
], AdminTripsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_admin_trip_dto_1.UpdateAdminTripDto]),
    __metadata("design:returntype", void 0)
], AdminTripsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminTripsController.prototype, "delete", null);
exports.AdminTripsController = AdminTripsController = __decorate([
    (0, common_1.Controller)('admin/trips'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_trips_service_1.AdminTripsService])
], AdminTripsController);
//# sourceMappingURL=admin-trips.controller.js.map