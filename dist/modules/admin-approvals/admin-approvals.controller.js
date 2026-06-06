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
exports.AdminApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const admin_approvals_service_1 = require("./admin-approvals.service");
const admin_approvals_query_dto_1 = require("./dto/admin-approvals-query.dto");
const reject_approval_dto_1 = require("./dto/reject-approval.dto");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
let AdminApprovalsController = class AdminApprovalsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(query, req) {
        return this.service.list(query, {
            userId: req?.user?.userId ?? '',
            role: req?.user?.role ?? '',
        });
    }
    approve(id, req) {
        const reviewerId = Number(req?.user?.userId ?? 0);
        return this.service.approve(id, reviewerId);
    }
    reject(id, dto, req) {
        const reviewerId = Number(req?.user?.userId ?? 0);
        return this.service.reject(id, reviewerId, dto.reason);
    }
};
exports.AdminApprovalsController = AdminApprovalsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_approvals_query_dto_1.AdminApprovalsQueryDto, Object]),
    __metadata("design:returntype", void 0)
], AdminApprovalsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminApprovalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_approval_dto_1.RejectApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], AdminApprovalsController.prototype, "reject", null);
exports.AdminApprovalsController = AdminApprovalsController = __decorate([
    (0, common_1.Controller)('admin/approvals'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    __metadata("design:paramtypes", [admin_approvals_service_1.AdminApprovalsService])
], AdminApprovalsController);
//# sourceMappingURL=admin-approvals.controller.js.map