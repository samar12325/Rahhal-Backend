import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStudentAttendanceDto {
  @IsString()
  @IsIn(['present', 'absent'])
  attendanceStatus: 'present' | 'absent';
}

export class UpdateSchoolTripLiveStatusDto {
  @IsOptional()
  @IsString()
  @IsIn(['created', 'in_progress', 'completed'])
  tripStatus?: 'created' | 'in_progress' | 'completed';

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  supervisorNotes?: string;
}
