import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const getTransformedValue = (
  value: unknown,
  obj: unknown,
  fallbackKey: string,
) => {
  if (value !== undefined && value !== null) return value;
  if (obj && typeof obj === 'object' && fallbackKey in obj) {
    return (obj as Record<string, unknown>)[fallbackKey];
  }
  return value;
};

export class CreateGroupTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'destinationId'),
  )
  @IsInt()
  @Min(1)
  destination_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'startDate'))
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start_date: string;

  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'endDate'))
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'durationDays'),
  )
  @IsInt()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'pricePerPerson'),
  )
  @IsNumber()
  @Min(0)
  price_per_person?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'maxParticipants'),
  )
  @IsInt()
  @Min(2)
  max_participants?: number;

  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'requiredParticipants'),
  )
  @IsInt()
  @Min(2)
  required_participants: number;

  @IsOptional()
  @IsString()
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'joinDeadline'),
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  join_deadline?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}
