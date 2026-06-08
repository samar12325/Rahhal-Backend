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
exports.UpdateSchoolTripLiveStatusDto = exports.UpdateStudentAttendanceDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateStudentAttendanceDto {
    attendanceStatus;
}
exports.UpdateStudentAttendanceDto = UpdateStudentAttendanceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['present', 'absent']),
    __metadata("design:type", String)
], UpdateStudentAttendanceDto.prototype, "attendanceStatus", void 0);
class UpdateSchoolTripLiveStatusDto {
    tripStatus;
    supervisorNotes;
}
exports.UpdateSchoolTripLiveStatusDto = UpdateSchoolTripLiveStatusDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['created', 'in_progress', 'completed']),
    __metadata("design:type", String)
], UpdateSchoolTripLiveStatusDto.prototype, "tripStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], UpdateSchoolTripLiveStatusDto.prototype, "supervisorNotes", void 0);
//# sourceMappingURL=update-school-trip-preparation.dto.js.map