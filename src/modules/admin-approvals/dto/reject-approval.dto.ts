import { IsString, MinLength } from 'class-validator';

export class RejectApprovalDto {
  @IsString()
  @MinLength(2)
  reason!: string;
}
