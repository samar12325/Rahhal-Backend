import { event_status } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  price_text?: string;

  @IsOptional()
  @IsDateString()
  start_datetime?: string;

  @IsOptional()
  @IsDateString()
  end_datetime?: string;

  @IsOptional()
  @IsUrl()
  official_booking_url?: string;

  @IsOptional()
  @IsEnum(event_status)
  status?: event_status;
}
