import { IsEnum, IsOptional } from 'class-validator';

export enum StatsRange {
  MONTH = 'month',
  SIX_MONTHS = '6months',
  YEAR = 'year',
}

export class StatsRangeDto {
  @IsEnum(StatsRange, {
    message: 'range must be one of month, 6months, or year',
  })
  @IsOptional()
  range?: StatsRange;
}
