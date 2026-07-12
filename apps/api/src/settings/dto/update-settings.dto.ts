import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() whatsapp?: string | null;
  @IsOptional() @IsString() telefono?: string | null;
  @IsOptional() @IsString() direccion?: string | null;
  @IsOptional() @IsNumber() lat?: number | null;
  @IsOptional() @IsNumber() lng?: number | null;

  /** SocialLink[] */
  @IsOptional() @IsArray() redes?: unknown[];

  /** Horario[] */
  @IsOptional() @IsArray() horarios?: unknown[];
}
