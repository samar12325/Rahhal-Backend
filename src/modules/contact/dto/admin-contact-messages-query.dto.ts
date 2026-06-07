import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const CONTACT_MESSAGE_FILTERS = ['all', 'new', 'sent', 'failed'] as const;

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export class AdminContactMessagesQueryDto {
  @Transform(({ value }: { value: unknown }) => {
    const normalized = normalizeString(value).toLowerCase();
    return normalized || 'all';
  })
  @IsOptional()
  @IsIn(CONTACT_MESSAGE_FILTERS)
  status?: 'all' | 'new' | 'sent' | 'failed';

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(190)
  q?: string;
}
