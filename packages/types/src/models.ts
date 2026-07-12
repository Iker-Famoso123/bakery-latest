/**
 * Formas compartidas de punta a punta (API ↔ admin ↔ público).
 *
 * Regla de fechas: todos los campos temporales son strings ISO 8601 en UTC.
 * La conversión a `America/Mexico_City` ocurre solo al presentar (ver `toMexico`).
 */

/** Respuesta de login/refresh de la API. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

/** Respuesta paginada estándar de la API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type Role = 'admin' | 'editor';
export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type CategoryType = 'post' | 'product';

/** Documento de TipTap (ProseMirror JSON). Se refina en la Fase 3. */
export type TiptapDoc = { type: 'doc'; content?: unknown[] };

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
}

export interface PostDto {
  id: string;
  title: string;
  slug: string;
  body: TiptapDoc;
  coverImage: string | null;
  status: PostStatus;
  publishAt: string;
  expiresAt: string | null;
  pinned: boolean;
  categoryId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

/** Una imagen de producto ya procesada: key en R2 + variantes servidas por CDN. */
export interface ProductImage {
  key: string;
  thumbnail: string;
  card: string;
  full: string;
}

export interface ProductDetails {
  ingredientes?: string[];
  precioInformativo?: number | null;
  disponibilidad?: string | null;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: ProductImage[];
  details: ProductDetails;
  categoryId: string | null;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Usuario expuesto por la API — NUNCA incluye `passwordHash`. */
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  tipo: string;
  url: string;
}

export interface Horario {
  dia: string;
  apertura: string;
  cierre: string;
}

export interface SettingsDto {
  whatsapp: string | null;
  telefono: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  redes: SocialLink[];
  horarios: Horario[];
  updatedAt: string;
}
