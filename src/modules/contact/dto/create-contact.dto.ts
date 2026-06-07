import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const CONTACT_TYPES = [
  'suggestion',
  'complaint',
  'inquiry',
  'partnership',
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export class CreateContactDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(190)
  email!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : (value ?? 'inquiry'),
  )
  @IsNotEmpty()
  @IsIn(CONTACT_TYPES)
  type!: ContactType;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(6)
  @MaxLength(2000)
  message!: string;
}
