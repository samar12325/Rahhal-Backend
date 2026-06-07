import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export class ReplyContactMessageDto {
  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(190)
  subject!: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(4000)
  reply_message!: string;
}
