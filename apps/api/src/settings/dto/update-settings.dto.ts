import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class ExpandMapsUrlDto {
  /** Enlace corto de Google Maps (p. ej. https://maps.app.goo.gl/…). */
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;
}

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
