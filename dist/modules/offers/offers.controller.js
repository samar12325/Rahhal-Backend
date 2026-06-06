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
exports.OffersController = void 0;
const common_1 = require("@nestjs/common");
const list_offers_dto_1 = require("./dto/list-offers.dto");
const offers_service_1 = require("./offers.service");
let OffersController = class OffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    list(query) {
        return this.offersService.list(query);
    }
    getById(id) {
        return this.offersService.getById(id);
    }
};
exports.OffersController = OffersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_offers_dto_1.ListOffersDto]),
    __metadata("design:returntype", void 0)
], OffersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OffersController.prototype, "getById", null);
exports.OffersController = OffersController = __decorate([
    (0, common_1.Controller)('api/offers'),
    __metadata("design:paramtypes", [offers_service_1.OffersService])
], OffersController);
//# sourceMappingURL=offers.controller.js.map