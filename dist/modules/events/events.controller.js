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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_event_dto_1 = require("./dto/create-event.dto");
const delete_event_dto_1 = require("./dto/delete-event.dto");
const list_events_dto_1 = require("./dto/list-events.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const events_service_1 = require("./events.service");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    list(query) {
        return this.eventsService.list(query, false);
    }
    getById(id) {
        return this.eventsService.getById(id, false);
    }
    adminList(query) {
        return this.eventsService.list(query, true);
    }
    create(dto) {
        return this.eventsService.create(dto);
    }
    update(id, dto) {
        return this.eventsService.update(id, dto);
    }
    remove(id, query) {
        return this.eventsService.remove(id, query);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_events_dto_1.ListEventsDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)('admin/events'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_events_dto_1.ListEventsDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "adminList", null);
__decorate([
    (0, common_1.Post)('admin/events'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('admin/events/:id'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('admin/events/:id'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, delete_event_dto_1.DeleteEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map