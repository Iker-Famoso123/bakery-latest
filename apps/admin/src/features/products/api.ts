import type { ProductDto, ProductImage } from '@rf/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from '../../lib/api';

export interface ProductInput {
  name: string;
  description: string | null;
  images: ProductImage[];
  details: {
    ingredientes?: string[];
    precioInformativo?: number | null;
    disponibilidad?: string | null;
  };
  active: boolean;
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: () => apiGet<ProductDto[]>('/products') });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiGet<ProductDto>(`/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveProduct(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      id ? apiPatch<ProductDto>(`/products/${id}`, input) : apiPost<ProductDto>('/products', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useReorderProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => apiPatch<ProductDto[]>('/products/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, crop }: { file: File; crop: CropArea }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('crop', JSON.stringify(crop));
      form.append('folder', 'products');
      return apiUpload<ProductImage>('/media/upload', form);
    },
  });
}
