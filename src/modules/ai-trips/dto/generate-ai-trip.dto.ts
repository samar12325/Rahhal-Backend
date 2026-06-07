import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

function normalizeNumberInput(value: unknown, fallback?: unknown) {
  const resolved = value ?? fallback;
  if (resolved === '' || resolved === null || resolved === undefined) {
    return undefined;
  }

  return Number(resolved);
}

export class GenerateAiTripDto {
  @IsOptional()
  @IsString()
  city?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(14)
  days!: number;

  @IsOptional()
  @Transform(({ value, obj }) =>
    normalizeNumberInput(value, (obj as { min_budget?: unknown }).min_budget),
  )
  @IsNumber()
  @Min(0)
  minBudget?: number;

  @IsOptional()
  @Transform(({ value, obj }) =>
    normalizeNumberInput(value, (obj as { max_budget?: unknown }).max_budget),
  )
  @IsNumber()
  @Min(0)
  maxBudget?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  people!: number;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  prefs?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ar', 'en'])
  locale?: 'ar' | 'en';
}
