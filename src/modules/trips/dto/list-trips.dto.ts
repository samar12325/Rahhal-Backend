import { destinations_region, trips_status, trips_type } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ListTripsDto {
  @IsOptional()
  @IsEnum(destinations_region)
  region?: destinations_region;

  @IsOptional()
  @IsEnum(trips_type)
  type?: trips_type;

  @IsOptional()
  @IsEnum(trips_status)
  status?: trips_status;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsNumberString()
  duration?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumberString()
  destinationId?: string;
}
