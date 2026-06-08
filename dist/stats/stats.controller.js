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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_cookie_guard_1 = require("../common/guards/jwt-cookie.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const stats_range_dto_1 = require("./dto/stats-range.dto");
const stats_service_1 = require("./stats.service");
let StatsController = class StatsController {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    getTripStats(query) {
        const range = query.range ?? stats_range_dto_1.StatsRange.MONTH;
        return this.statsService.getDashboard(range);
    }
    getLegacyDashboard(query) {
        const range = query.range ?? stats_range_dto_1.StatsRange.MONTH;
        return this.statsService.getDashboard(range);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('dashboard/trip-stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stats_range_dto_1.StatsRangeDto]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "getTripStats", null);
__decorate([
    (0, common_1.Get)('admin/stats/dashboard'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stats_range_dto_1.StatsRangeDto]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "getLegacyDashboard", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map