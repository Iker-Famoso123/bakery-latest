import { Injectable } from '@nestjs/common';
import type { ProductImage } from '@rf/types';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { R2Service } from './r2.service';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Anchos (px) de cada variante WebP generada. */
const VARIANTS = { thumbnail: 200, card: 600, full: 1200 } as const;

@Injectable()
export class MediaService {
  constructor(private readonly r2: R2Service) {}

  /**
   * Recorta con las coordenadas de `react-easy-crop`, genera las tres variantes
   * WebP y las sube a R2. Devuelve las URLs listas para servir por CDN.
   */
  async processAndUpload(
    buffer: Buffer,
    crop: CropArea,
    folder: 'posts' | 'products',
  ): Promise<ProductImage> {
    const baseKey = `${folder}/${randomUUID()}`;
    const region = {
      left: Math.round(crop.x),
      top: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height),
    };

    const entries = await Promise.all(
      (Object.entries(VARIANTS) as [keyof typeof VARIANTS, number][]).map(
        async ([name, width]) => {
          const out = await sharp(buffer)
            .rotate() // respeta la orientación EXIF antes de recortar
            .extract(region)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
          const url = await this.r2.upload(`${baseKey}/${name}.webp`, out, 'image/webp');
          return [name, url] as const;
        },
      ),
    );

    const urls = Object.fromEntries(entries) as Record<keyof typeof VARIANTS, string>;
    return {
      key: baseKey,
      thumbnail: urls.thumbnail,
      card: urls.card,
      full: urls.full,
    };
  }
}
