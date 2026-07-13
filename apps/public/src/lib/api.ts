import type { Paginated, PostDto, ProductDto, SettingsDto } from '@rf/types';

const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`API respondió ${res.status} en ${path}`);
  return (await res.json()) as T;
}

/** Envuelve una llamada para degradar con gracia si la API no responde. */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export const getPosts = (page = 1, limit = 9) =>
  get<Paginated<PostDto>>(`/public/posts?page=${page}&limit=${limit}`);

export const getPost = (slug: string) =>
  get<PostDto>(`/public/posts/${encodeURIComponent(slug)}`);

export const getProducts = () => get<ProductDto[]>('/public/products');

export const getProduct = (slug: string) =>
  get<ProductDto>(`/public/products/${encodeURIComponent(slug)}`);

export const getSettings = () => get<SettingsDto>('/public/settings');
