import type { ProductImage } from '@rf/types';
import { useMutation } from '@tanstack/react-query';
import { apiUpload } from './api';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Sube una imagen a R2 vía la API (sharp recorta y genera variantes
 * thumbnail/card/full en WebP). `folder` separa productos de portadas.
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, crop, folder }: { file: File; crop: CropArea; folder: string }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('crop', JSON.stringify(crop));
      form.append('folder', folder);
      return apiUpload<ProductImage>('/media/upload', form);
    },
  });
}
