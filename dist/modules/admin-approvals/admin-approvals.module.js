"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminApprovalsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const admin_approvals_controller_1 = require("./admin-approvals.controller");
const admin_approvals_service_1 = require("./admin-approvals.service");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
let AdminApprovalsModule = class AdminApprovalsModule {
};
exports.AdminApprovalsModule = AdminApprovalsModule;
exports.AdminApprovalsModule = AdminApprovalsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [admin_approvals_controller_1.AdminApprovalsController],
        providers: [admin_approvals_service_1.AdminApprovalsService, jwt_cookie_guard_1.JwtCookieGuard, admin_guard_1.AdminGuard],
    })
], AdminApprovalsModule);
//# sourceMappingURL=admin-approvals.module.js.map