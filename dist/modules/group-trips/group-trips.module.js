"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTripsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const auth_module_1 = require("../auth/auth.module");
const group_trips_controller_1 = require("./group-trips.controller");
const group_trips_service_1 = require("./group-trips.service");
let GroupTripsModule = class GroupTripsModule {
};
exports.GroupTripsModule = GroupTripsModule;
exports.GroupTripsModule = GroupTripsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [group_trips_controller_1.GroupTripsController],
        providers: [group_trips_service_1.GroupTripsService, jwt_cookie_guard_1.JwtCookieGuard],
    })
], GroupTripsModule);
//# sourceMappingURL=group-trips.module.js.map