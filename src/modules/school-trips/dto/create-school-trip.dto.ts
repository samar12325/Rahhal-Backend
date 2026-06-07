import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
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

export class CreateSchoolTripDto {
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

  @Type(() => Number)
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'placeId'))
  @IsInt()
  @Min(1)
  place_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'startDate'))
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start_date: string;

  @IsString()
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'endDate'))
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end_date: string;

  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'durationDays'),
  )
  @IsInt()
  @Min(1)
  duration_days: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'maxParticipants'),
  )
  @IsInt()
  @Min(1)
  max_participants?: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'schoolName'))
  school_name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'educationLevel'),
  )
  education_level: string;

  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'studentsCount'),
  )
  @IsInt()
  @Min(1)
  students_count: number;

  @Type(() => Number)
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'supervisorsCount'),
  )
  @IsInt()
  @Min(1)
  supervisors_count: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'transportType'),
  )
  transport_type: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value, obj }) =>
    getTransformedValue(value, obj, 'meetingPoint'),
  )
  meeting_point: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
