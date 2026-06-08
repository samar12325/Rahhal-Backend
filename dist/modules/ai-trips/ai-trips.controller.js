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
exports.AiTripsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_cookie_guard_1 = require("../../common/guards/jwt-cookie.guard");
const ai_trips_service_1 = require("./ai-trips.service");
const chat_ai_trip_dto_1 = require("./dto/chat-ai-trip.dto");
const generate_ai_trip_dto_1 = require("./dto/generate-ai-trip.dto");
let AiTripsController = class AiTripsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.listSessions(req.user.userId);
    }
    generate(req, dto) {
        return this.service.generate(req.user.userId, dto);
    }
    startAssistantSession(req, dto) {
        return this.service.startAssistantSession(req.user.userId, dto);
    }
    chat(req, id, dto) {
        return this.service.chat(req.user.userId, id, dto);
    }
    getById(req, id) {
        return this.service.getSession(req.user.userId, id);
    }
};
exports.AiTripsController = AiTripsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiTripsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_ai_trip_dto_1.GenerateAiTripDto]),
    __metadata("design:returntype", void 0)
], AiTripsController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('assistant'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_ai_trip_dto_1.ChatAiTripDto]),
    __metadata("design:returntype", void 0)
], AiTripsController.prototype, "startAssistantSession", null);
__decorate([
    (0, common_1.Post)(':id/chat'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_ai_trip_dto_1.ChatAiTripDto]),
    __metadata("design:returntype", void 0)
], AiTripsController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AiTripsController.prototype, "getById", null);
exports.AiTripsController = AiTripsController = __decorate([
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieGuard),
    (0, common_1.Controller)('api/ai-trips'),
    __metadata("design:paramtypes", [ai_trips_service_1.AiTripsService])
], AiTripsController);
//# sourceMappingURL=ai-trips.controller.js.map