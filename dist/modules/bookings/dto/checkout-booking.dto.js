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
exports.CheckoutBookingDto = exports.CheckoutPaymentMethod = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var CheckoutPaymentMethod;
(function (CheckoutPaymentMethod) {
    CheckoutPaymentMethod["card"] = "card";
    CheckoutPaymentMethod["applepay"] = "applepay";
})(CheckoutPaymentMethod || (exports.CheckoutPaymentMethod = CheckoutPaymentMethod = {}));
class CheckoutBookingDto {
    tripId;
    destinationId;
    date;
    time;
    people;
    paymentMethod;
    amount;
}
exports.CheckoutBookingDto = CheckoutBookingDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CheckoutBookingDto.prototype, "tripId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CheckoutBookingDto.prototype, "destinationId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CheckoutBookingDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], CheckoutBookingDto.prototype, "time", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], CheckoutBookingDto.prototype, "people", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CheckoutPaymentMethod),
    __metadata("design:type", String)
], CheckoutBookingDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CheckoutBookingDto.prototype, "amount", void 0);
//# sourceMappingURL=checkout-booking.dto.js.map