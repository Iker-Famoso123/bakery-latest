import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

/**
 * Contrato de variables de entorno. La API no arranca si falta algo crítico
 * (ej. el secreto de JWT), fallando temprano y claro en vez de a mitad de uso.
 */
class EnvVars {
  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsInt()
  PORT?: number;

  @IsString()
  @MinLength(16, { message: 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres' })
  JWT_ACCESS_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_TTL?: string;

  @IsOptional()
  @IsInt()
  REFRESH_TTL_DAYS?: number;

  // Cloudflare R2 — opcionales hasta que se use el módulo de media (Bloque E).
  @IsOptional() @IsString() R2_ACCOUNT_ID?: string;
  @IsOptional() @IsString() R2_ACCESS_KEY_ID?: string;
  @IsOptional() @IsString() R2_SECRET_ACCESS_KEY?: string;
  @IsOptional() @IsString() R2_BUCKET?: string;
  @IsOptional() @IsString() R2_PUBLIC_URL?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const detail = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Configuración de entorno inválida:\n  - ${detail}`);
  }
  return validated;
}
