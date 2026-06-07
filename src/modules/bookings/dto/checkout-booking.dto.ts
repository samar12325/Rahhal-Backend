import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export enum CheckoutPaymentMethod {
  card = 'card',
  applepay = 'applepay',
}

export class CheckoutBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  tripId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  destinationId: number;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  time: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  people: number;

  @IsEnum(CheckoutPaymentMethod)
  paymentMethod: CheckoutPaymentMethod;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  amount?: number;
}
