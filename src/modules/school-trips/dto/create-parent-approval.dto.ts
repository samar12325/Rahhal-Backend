import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
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

export class CreateParentApprovalDto {
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  parentName: string;

  @IsString()
  @Matches(/^05\d{8}$/)
  parentPhone: string;

  @IsEmail()
  parentEmail: string;

  @IsOptional()
  @IsString()
  tripName?: string;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value, obj }) => getTransformedValue(value, obj, 'tripId'))
  @IsInt()
  @Min(1)
  trip_id?: number;
}

export class UpdateParentApprovalStatusDto {
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  approvalStatus: string;
}
