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
exports.UpdateParentApprovalStatusDto = exports.CreateParentApprovalDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const getTransformedValue = (value, obj, fallbackKey) => {
    if (value !== undefined && value !== null)
        return value;
    if (obj && typeof obj === 'object' && fallbackKey in obj) {
        return obj[fallbackKey];
    }
    return value;
};
class CreateParentApprovalDto {
    studentName;
    parentName;
    parentPhone;
    parentEmail;
    tripName;
    trip_id;
}
exports.CreateParentApprovalDto = CreateParentApprovalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateParentApprovalDto.prototype, "studentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateParentApprovalDto.prototype, "parentName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^05\d{8}$/),
    __metadata("design:type", String)
], CreateParentApprovalDto.prototype, "parentPhone", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateParentApprovalDto.prototype, "parentEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateParentApprovalDto.prototype, "tripName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'tripId')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateParentApprovalDto.prototype, "trip_id", void 0);
class UpdateParentApprovalStatusDto {
    approvalStatus;
}
exports.UpdateParentApprovalStatusDto = UpdateParentApprovalStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['pending', 'approved', 'rejected']),
    __metadata("design:type", String)
], UpdateParentApprovalStatusDto.prototype, "approvalStatus", void 0);
//# sourceMappingURL=create-parent-approval.dto.js.map