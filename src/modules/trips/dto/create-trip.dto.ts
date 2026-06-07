import { trips_status, trips_type } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  destination_id: number;

  @IsEnum(trips_type)
  type: trips_type;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end_date?: string;

  @IsOptional()
  @IsNumber()
  duration_days?: number;

  @IsOptional()
  @IsNumber()
  price_per_person?: number;

  @IsOptional()
  @IsNumber()
  max_participants?: number;

  @IsEnum(trips_status)
  status: trips_status;

  @IsNumber()
  created_by: number;
}
