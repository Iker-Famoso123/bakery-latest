import { IsIn, IsString } from 'class-validator';

export class UploadImageDto {
  /** Carpeta lógica en R2. */
  @IsIn(['posts', 'products'])
  folder!: 'posts' | 'products';

  /** JSON con las coordenadas de recorte: { x, y, width, height } (px). */
  @IsString()
  crop!: string;
}
