import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class UploadParentApprovalsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tripId: number;
}

export class SendAllParentApprovalStudentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  rowNumber?: number;

  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  fatherName: string;

  @IsString()
  @Matches(/^05\d{8}$/)
  parentPhone: string;

  @IsEmail()
  email: string;
}

export class SendAllParentApprovalsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tripId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SendAllParentApprovalStudentDto)
  students: SendAllParentApprovalStudentDto[];
}
