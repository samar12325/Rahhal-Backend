import { trips_status, trips_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsArray,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAdminTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destination_id?: number;

  @IsOptional()
  @IsEnum(trips_type)
  type?: trips_type;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive()
  price_per_person?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive()
  old_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_participants?: number;

  @IsOptional()
  @IsEnum(trips_status)
  status?: trips_status;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];
}
