import { trips_type } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ApprovalStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export class AdminApprovalsQueryDto {
  @IsOptional()
  @IsEnum(trips_type)
  type?: trips_type;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  q?: string;
}
