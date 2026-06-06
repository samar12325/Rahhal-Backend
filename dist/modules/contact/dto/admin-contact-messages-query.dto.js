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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminContactMessagesQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const CONTACT_MESSAGE_FILTERS = ['all', 'new', 'sent', 'failed'];
function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
class AdminContactMessagesQueryDto {
    status;
    q;
}
exports.AdminContactMessagesQueryDto = AdminContactMessagesQueryDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        const normalized = normalizeString(value).toLowerCase();
        return normalized || 'all';
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(CONTACT_MESSAGE_FILTERS),
    __metadata("design:type", String)
], AdminContactMessagesQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => normalizeString(value)),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(190),
    __metadata("design:type", String)
], AdminContactMessagesQueryDto.prototype, "q", void 0);
//# sourceMappingURL=admin-contact-messages-query.dto.js.map