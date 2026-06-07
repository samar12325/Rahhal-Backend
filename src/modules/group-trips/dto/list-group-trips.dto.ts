import { trips_status } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ListGroupTripsDto {
  @IsOptional()
  @IsEnum(trips_status)
  status?: trips_status;

  @IsOptional()
  @IsNumberString()
  createdBy?: string;

  @IsOptional()
  @IsNumberString()
  destinationId?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
