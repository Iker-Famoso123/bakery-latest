import { IsString, MinLength } from 'class-validator';

/** Usado tanto para refrescar como para cerrar sesión. */
export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
