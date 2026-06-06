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
exports.CreateSchoolTripDto = void 0;
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
class CreateSchoolTripDto {
    title;
    destination_id;
    place_id;
    description;
    start_date;
    end_date;
    duration_days;
    max_participants;
    school_name;
    education_level;
    students_count;
    supervisors_count;
    transport_type;
    meeting_point;
    notes;
}
exports.CreateSchoolTripDto = CreateSchoolTripDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'destinationId')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "destination_id", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'placeId')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "place_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'startDate')),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'endDate')),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "end_date", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'durationDays')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "duration_days", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'maxParticipants')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "max_participants", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'schoolName')),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "school_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'educationLevel')),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "education_level", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'studentsCount')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "students_count", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'supervisorsCount')),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSchoolTripDto.prototype, "supervisors_count", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'transportType')),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "transport_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value, obj }) => getTransformedValue(value, obj, 'meetingPoint')),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "meeting_point", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSchoolTripDto.prototype, "notes", void 0);
//# sourceMappingURL=create-school-trip.dto.js.map